/* eslint-disable no-useless-catch */
const client = require("./client");
const bcrypt = require('bcrypt');

//hash password and check hashed password
async function hashPassword({password}) {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

async function checkPassword(password, hashed) {
  const compare = await bcrypt.compare(password, hashed);
  return compare;
}

// user functions
async function createUser({ username, password }) {
  try {
    const newPassword = await hashPassword({password});

    const { rows: [ user ] } = await client.query(`
    INSERT INTO users(username, password)
    VALUES($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING id, username;
    `, [username, newPassword]);

    return user;
  } catch (error) {
    throw error;
  }

}

async function getUser({ username, password }) {
  try {
    const { rows: [ user ] } = await client.query(`
    SELECT * FROM users
    WHERE username=$1;
    `, [username]);
    
    const match = await checkPassword(password, user.password);
  
    if(!match) {
      delete user.password;
      return null;
    }
    
    delete user.password;

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
  SELECT id, username, password
  FROM users
  WHERE id=$1
  `, [userId])

  delete user.password;
  
  return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
  SELECT *
  FROM users
  WHERE username=$1;
  `, [username]);

  return user;
  } catch (error) {
    throw error;
  }
}


module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
