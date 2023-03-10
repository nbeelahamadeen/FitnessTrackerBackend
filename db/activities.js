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

const attachActivitiesToRoutines = (routines) => {
  const routinesById = {};
  routines.forEach(routine => {
    if(!routinesById[routine.id]) {
      routinesById[routine.id] = {
        id: routine.id,
        creatorId: routine.creatorId,
        creatorName: routine.creatorName,
        isPublic: routine.isPublic, 
        name: routine.name,
        goal: routine.goal,
        activities: [],
      }
    }
    const activity = {
      routineId: routine.id,
      routineActivityId: routine.routineActivityId,
      name: routine.activityName,
      id: routine.activityId, 
      description: routine.description, 
      count: routine.count,
      duration: routine.duration,
    }
    //console.log(activity);
    routinesById[routine.id].activities.push(activity);
  })
  return routinesById;
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
