/* eslint-disable no-useless-catch */
const client = require("./client");
const { getUserById } = require('./users');
const { attachActivitiesToRoutines } = require("./activities");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
  const { rows: [routine] } = await client.query(`
  INSERT INTO routines("creatorId", "isPublic", name, goal)
  VALUES($1, $2, $3, $4)
  ON CONFLICT (name) DO NOTHING
  RETURNING *
  `, [creatorId,isPublic, name, goal])
  return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
    SELECT *
    FROM routine
    WHERE id=$1
    `,[id])

    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  const {  rows } = await client.query(`
  SELECT *
  FROM routines
  `)
  return rows;
}

async function getAllRoutines() {
  try {
    let { rows } = await client.query(`
    SELECT routines.*, count, duration, activities.name as "activityName", 
    activities.id as "activityId", description, username as "creatorName", 
    routine_activities.id as "routineActivityId" FROM routines
      JOIN routine_activities ON routines.id = routine_activities."routineId"
      JOIN activities ON activities.id = routine_activities."activityId"
      JOIN users ON routines."creatorId" = users.id
    `);

    let routines = attachActivitiesToRoutines(rows);
    routines = Object.values(routines);

    return routines;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    let routines = await getAllRoutines();

    routines = routines.filter(routine => {
      return routine.isPublic
    });
 
    return routines;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    
    let routines = await getAllRoutines();

    routines = routines.filter(routine => {
      return routine.creatorName === username;
    })

    return routines;

  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
        
    let routines = await getAllPublicRoutines();

    routines = routines.filter(routine => {
      return routine.creatorName === username;
    })

    return routines;

  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
