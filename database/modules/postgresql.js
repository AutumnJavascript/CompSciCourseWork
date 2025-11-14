import pg from "pg"
import bcrypt from "bcrypt"
const {Pool} = pg;

const pool = new Pool({
  user: process.env.DBUSER,
  password: process.env.PASSWORD,
  host: process.env.DBHOST,
  port: process.env.PORT,
  database: process.env.DATABASE,
});

export async function testquery() {

    const client = await pool.connect();

    try {
      const query = `
          insert into users
          (username, hashed_password, email)
          values
          ('ariana', 'jkd82haksjdeazkf', 'email@email.com');
      `;

      const response = await client.query(query);

    } catch (error) {
      // console.log(error.code)
    }

    client.release();

}

export async function dbRegister(username, password, email) {

  const passwordHash = await bcrypt.hash(password, Number(process.env.SALTROUNDS));
  const client = await pool.connect();

  try {
    const query = `
      insert into users
      (username, hashed_password, email)
      values
      ($1, $2, $3);
    `;
    const params = [username, passwordHash, email];
    const response = await client.query(query, params);
    
    console.log(response);
    client.release();

    return 200;

  } catch (error) {

    client.release();
    if (error.code == 23505) return error.code;
  }

}

export async function dbLogin({identifiertype, identifier, password}) {

  const client = await pool.connect();

  try {
    const query = `
      select user_id, username, hashed_password
      from users
      where ${identifiertype} = $1
    `;

    const params = [identifier];
    const response = await client.query(query, params);
    
    // console.log(response.rows[0]);

    //  Account does not exist
    if (response.rows.length === 0) return {code: 404};

    const passwordHash = response.rows[0].hashed_password;
    const match = await bcrypt.compare(password, passwordHash);

    delete response.rows[0].hashed_password;

    client.release();

    //  If password incorrect
    if (!match) return {code: 401};

    //  Password correct
    return {code: 200, userInfo: response.rows[0]};

  } catch (error) {
    console.log(error);
  }
}


export async function postupload(user_id, formdata, savedfilenames, savedfiletypes) {

  //  Adding entry into post table
  const title = formdata.get("title")
  const description = formdata.get("description")
  const posttype = (savedfilenames.length == 0) ? "text" : "carousel";
  const client = await pool.connect();

  await client.query("BEGIN");
  const addPostQuery = `
    insert into post (user_id, title, description, post_type)
    values ($1, $2, $3, $4)
    returning post_id
  `;

  const queryParams = [user_id, title, description, posttype];
  const response = await client.query(addPostQuery, queryParams);


  //  Adding entries into postmedia table
  //  The map function will return a new array
  //  Here the array will contain a part of a SQL statement
  let postmediaquery = savedfilenames.map((value, index) => {

    // Format: (Post_id , paramterised query placeholder ,  mimetype)
    return `(${response.rows[0].post_id}, $${index + 1}, '${savedfiletypes[index]}')`
  }).join(',');

  //  Constructs the full SQL statement
  const addPostMediaQuery = `
    insert into post_media (post_id, filename, mimetype)
    values ${postmediaquery}
  `;

  await client.query(addPostMediaQuery, savedfilenames);
  await client.query("COMMIT");
  client.release();
}

export async function getPosts(userid) {

  const client = await pool.connect();

  try {

   const postQuery = `
      select 
        post.*, 
        u.username, 
        (select count(user_id) from post_like where post_id = post.post_id) likecount,
        exists( select * from post_like pl
          where 
            pl.user_id = $1 and pl.post_id = post.post_id
        ) user_liked
      from (select * from post limit 3) post
      left join users u
        on post.user_id = u.user_id
      left join post_like pl
        on post.post_id = pl.post_id
    `;
    const postslist = await client.query(postQuery, [userid]);
    // console.log(postslist.rows);


    const postparams = postslist.rows.map((value) => {
      return `post_id = ${value.post_id}`
    }).join(" or ");
    //  post_id = 1 or post_id = 2 ....
    const postMediaQuery = `
      select post_media_id, filename, mimetype, post_id
      from post_media
      where ${postparams}
    `;

    const mediafiles = await client.query(postMediaQuery);
    // console.log(mediafiles.rows);


    client.release();
    return {postslist: postslist.rows, mediafiles: mediafiles.rows};

  } catch (error) {
    console.log(error);
  }

}

export async function likepost(userid, postid) {

  const client = await pool.connect();
  await client.query("BEGIN");
  let returnresponse = {};

  const likedquery = `
    select * from post_like
    where user_id = $1 and post_id = $2
  `;
  const likedqueryparams = [userid, postid];

  const likedresponse = await client.query(likedquery, likedqueryparams);

  if (likedresponse.rows.length == 0) {
    //  not liked yet
    const addlikequery = `
      with insert as (
        insert into post_like (user_id, post_id)
        values ($1, $2)
        returning post_id
      )
      select count(user_id)
      from post_like
      where post_id = (select post_id from insert)
    `;
    const addlikeresponse = await client.query(addlikequery, likedqueryparams);
    returnresponse = {
      likecount: addlikeresponse.rows[0].count,
      liked: true
    };
  } else {
    //  already liked
    const removelikequery = `
      with remove as (
        delete from post_like
        where user_id = $1 and post_id = $2
        returning post_id
      )
      select count(user_id)
      from post_like
      where post_id = (select post_id from remove)       
    `;
    const removelikeresponse = await client.query(removelikequery, likedqueryparams);
    returnresponse = {
      likecount: removelikeresponse.rows[0].count,
      liked: false
    };
  }

  client.query("COMMIT");
  client.release();

  return returnresponse;
}

export async function addcomment(userid, postid, comment) {

  const client = await pool.connect();

  try {

    client.query("BEGIN");

   const commentQuery = `
    with i as (
      insert into post_comment
        (post_id, user_id, comment)
      values
        ($1, $2, $3)
      returning *
    ) 
    select i.*, u.username
    from i
    left join users u 
      on i.user_id = u.user_id
    `;
    const commentQueryParams = [postid, userid, comment];
    const commentrequest = await client.query(commentQuery, commentQueryParams);

    client.release();
    return commentrequest.rows[0];

  } catch (error) {
    console.log(error);
  }


}

export async function getcomments(postid){
  const client = await pool.connect();

  try {

   const commentQuery = `
    select pc.*, u.username
    from post_comment pc
    left join users u 
      on pc.user_id = u.user_id
    where post_id = $1
    `;
    const commentrequest = await client.query(commentQuery, [postid]);

    client.release();

    return commentrequest.rows;

  } catch (error) {
    console.log(error);
  }

}

export async function getuser(userid) {

  const client = await pool.connect();

  try {

   const userQuery = `
    select username, description, profilepicname
    from users 
    where user_id = $1
    `;
    const userrequest = await client.query(userQuery, [userid]);

    client.release();

    return userrequest.rows[0];

  } catch (error) {
    console.log(error);
  }
}

export async function profilepageDB(filename, userid) { 
  const client = await pool.connect();

  try {
    const addfilenamequery = `
      update users
      set profilepicname = $1
      where user_id = $2
    `;
    const userrequest = await client.query(addfilenamequery, [filename, userid]);
    client.release();

    return {ok: true};

  } catch (error) {

    console.log(error);
    return {ok: false};
  }

}

export async function getuserposts(getuserid, personaluserid) {
  const client = await pool.connect();

  try {

   const postQuery = `
      select 
        post.*, 
        u.username, 
        (select count(user_id) from post_like where post_id = post.post_id) likecount,
        exists( select * from post_like pl
          where 
            pl.user_id = $2 and pl.post_id = post.post_id
        ) user_liked
      from (select * from post where user_id = $1 limit 3) post
      left join users u
        on post.user_id = u.user_id
      left join post_like pl
        on post.post_id = pl.post_id
    `;
    const postslist = await client.query(postQuery, [getuserid, personaluserid]);

    const postparams = postslist.rows.map((value) => {
      return `post_id = ${value.post_id}`
    }).join(" or ");
    //  post_id = 1 or post_id = 2 ....
    const postMediaQuery = `
      select post_media_id, filename, mimetype, post_id
      from post_media
      where ${postparams}
    `;
    const mediafiles = await client.query(postMediaQuery);


    client.release();
    return {postslist: postslist.rows, mediafiles: mediafiles.rows};

  } catch (error) {
    console.log(error);
  }
}