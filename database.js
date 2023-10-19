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

    if (result.affectedRows !== 1) {
      throw new Error("User not created");
    }

    const userId = result.insertId;
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User created",
        user: getUserByNetlifyID(userId),
      }),
    };
  } catch (err) {
    return {};
  }
};

export { getUsers, getUserByNetlifyID, createUser };
