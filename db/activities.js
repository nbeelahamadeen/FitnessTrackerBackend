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
    console.log("Starting to attach activities to Routines");
    for(let i = 0; i < routines.length; i++) {
      let routine = routines[i];
      let routineActivities = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId"=$1
      `, [routine.id]);
      routine.activities = [];
      for(let j = 0; j < routineActivities.length; j++) {
        let activity = routineActivities[i];
        let relatedActivity = await client.query(`
        SELECT * FROM activities 
        WHERE id=$1
        `, [activity.activityId]);
        routine.activities.push(relatedActivity);
      }
    }
    console.log("Finished attaching activities to Routines");
    return routines;
  } catch (error) {
    throw error;
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
