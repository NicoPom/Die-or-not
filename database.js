import mysql from "mysql2";

const pool = mysql.createPool(process.env.DB_URL_DEV).promise();

const getUsers = async () => {
  try {
    const [result] = await pool.query("SELECT * FROM users");
    return result;
  } catch (err) {
    console.error(err);
  }
};

const getUserByNetlifyId = async (id) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM users WHERE netlify_id = ?",
      [id]
    );
    return result;
  } catch (err) {
    console.error(err);
  }
};

const getUserByStripeId = async (id) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM users WHERE stripe_id = ?",
      [id]
    );
    return result;
  } catch (err) {
    console.error(err);
  }
};

const addApiCallCount = async (id) => {
  try {
    const [result] = await pool.query(
      "UPDATE users SET api_calls = api_calls + 1 WHERE netlify_id = ?",
      [id]
    );
    if (result.affectedRows !== 1) {
      throw new Error("User not updated");
    }
    console.log("+1 api call count", await getUserByNetlifyId(id));
  } catch (err) {
    console.error(err);
  }
};

const resetApiCallCount = async (id) => {
  try {
    const [result] = await pool.query(
      "UPDATE users SET api_calls = 0 WHERE netlify_id = ?",
      [id]
    );
    if (result.affectedRows !== 1) {
      throw new Error("User not updated");
    }
    console.log("reset api call count", await getUserByNetlifyId(id));
  } catch (err) {
    console.error(err);
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
    console.log("done");
    return await getUserByNetlifyId(userId);
  } catch (err) {
    console.error(err);
    return err;
  }
};

export {
  getUsers,
  getUserByNetlifyId,
  getUserByStripeId,
  createUser,
  addApiCallCount,
  resetApiCallCount,
};
