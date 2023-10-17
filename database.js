import mysql from "mysql2";

const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

const getUsers = async () => {
  const [result] = await pool.query("SELECT * FROM users");
  return result;
};

const getUser = async (id) => {
  const [result] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return result;
};

const createUser = async (user) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, subscribed, unique_id) VALUES (?, ?, ?, ?)",
    [user.name, user.email, user.subscribed, user.unique_id]
  );
  const userId = result.insertId;
  return getUser(userId);
};

export { getUsers, getUser, createUser };
