/* eslint-disable no-useless-catch */
const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  try {
    const {rows: [activity]} = await client.query(`
    INSERT INTO activities(name, description)
    VALUES ($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *`, 
    [name, description]);
    
    return activity;
  } catch(err) {
    throw err;
  }
}

async function getAllActivities() {
  try {
    const { rows } = await client.query(`
    SELECT * FROM activities;
    `);
    
    return rows;
  } catch (err) {
    throw err;
  }
}

async function getActivityById(id) {
  try {
    const {rows: [activity]} = await client.query(`
    SELECT * FROM activities
    WHERE ID=$1`, 
    [id]);
    
    return activity;
  } catch(err) {
    throw err;
  }
}

async function getActivityByName(name) {
  try{
    const { rows:[activity] } = await client.query(`
    SELECT * FROM activities
    WHERE name=$1
    `, [name]);
    
    return activity;
  } catch(err){
    throw err;
  }
}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  try {
    
  } catch (error) {
    
  }
}

async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1}`).join(', ');
 
  if(setString.length === 0) {
    return;
  }

  try {
    const { rows: [activity] } = await client.query(`
    UPDATE activities 
    SET ${setString}
    WHERE id=${id}
    RETURNING *`, 
    Object.values(fields));
    
    return activity;
  } catch(err) {
    throw err;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
