import mysql from "mysql2";

const pool = mysql.createPool(process.env.DB_URL).promise();

const getUsers = async () => {
  const [result] = await pool.query("SELECT * FROM users");
  return result;
};

const getUserById = async (id) => {
  const [result] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return result;
};

const getUserByNetlifyId = async (id) => {
  const [result] = await pool.query(
    "SELECT * FROM users WHERE netlify_id = ?",
    [id]
  );
  return result;
};

const getUserByStripeId = async (id) => {
  const [result] = await pool.query("SELECT * FROM users WHERE stripe_id = ?", [
    id,
  ]);
  return result;
};

const addApiCallCount = async (id) => {
  const [result] = await pool.query(
    "UPDATE users SET api_calls = api_calls + 1 WHERE netlify_id = ?",
    [id]
  );
  const [updatedUser] = await getUserByNetlifyId(id);
  return updatedUser;
};

const updateUserRole = async (id, role) => {
  const [result] = await pool.query(
    "UPDATE users SET role = ? WHERE netlify_id = ?",
    [role, id]
  );
  const [updatedUser] = await getUserByNetlifyId(id);
  console.log(updatedUser);
  return updatedUser;
};

const createUser = async (user) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, role, netlify_id, stripe_id) VALUES (?, ?, ?, ?, ?)",
    [user.name, user.email, user.role, user.netlify_id, user.stripe_id]
  );
  const [newUser] = await getUserById(result.insertId);
  return newUser;
};

export {
  getUsers,
  getUserByNetlifyId,
  getUserByStripeId,
  createUser,
  addApiCallCount,
  updateUserRole,
};
