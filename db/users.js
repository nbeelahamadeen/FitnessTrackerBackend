const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  const { rows: [ user ] } = await client.query(`
  INSERT INTO users(username, password)
  VALUES($1, $2)
  ON CONFLICT (username) DO NOTHING
  RETURNING *;
  `, [username, password]);
  return user;

}

async function getUser({ username, password }) {
  const { rows } = await client.query(`
  SELECT id, username, password
  FROM users;
  `, [username, password]);
  return rows;
}

async function getUserById(userId) {
  const { row: [user] } = await client.query(`
  SELECT id, username, password
  FROM users
  WHERE id=${userId}
  `)
  return user;
}

async function getUserByUsername(username) {
  const { rows: [user] } = await client.query(`
  SELECT *
  FROM users
  WHERE username=$1;
  `, [username]);

  return user;
}


module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
