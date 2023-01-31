/* eslint-disable no-useless-catch */
const client = require("./client");
const { getUserById } = require('./users');

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
    const { rows: routines } = await client.query(`
    SELECT * 
    FROM routines
    `)
    console.log(routines)
    routines.map(async routine =>   {
      routine.creatorName = await getUserById(routine.creatorId)
      return routine;
    })


    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

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
