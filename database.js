import mysql from "mysql2";

const pool = mysql.createPool(process.env.DB_URL_DEV).promise();

const getUsers = async () => {
  try {
    const [result] = await pool.query("SELECT * FROM users");
    return result;
  } catch (err) {
    console.log(err);
  }
};

const getUserByNetlifyID = async (id) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM users WHERE netlify_id = ?",
      [id]
    );
    return result;
  } catch (err) {
    console.log(err);
  }
};

const createUser = async (user) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, role, netlify_id, stripe_id) VALUES (?, ?, ?, ?, ?)",
      [user.name, user.email, user.role, user.netlify_id, user.stripe_id]
    );
    const userId = result.insertId;
    return getUserByNetlifyID(userId);
  } catch (err) {
    console.log(err);
  }
};

export { getUsers, getUserByNetlifyID, createUser };
