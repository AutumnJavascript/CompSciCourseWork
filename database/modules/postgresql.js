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


export async function postupload(user_id, formdata, savedfilenames) {

  const title = formdata.get("title")
  const description = formdata.get("title")
  const posttype = (savedfilenames.length == 0) ? "text" : "carousel";
  const client = await pool.connect();

  await client.query("BEGIN");
  const addPostQuery = `
    insert into post (user_id, title, description, post_type)
    values ($1, $2, $3, $4)
    returning post_id
  `;
  const queryParams = [user_id, title, description, posttype];

  
}