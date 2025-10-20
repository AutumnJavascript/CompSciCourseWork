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
}

