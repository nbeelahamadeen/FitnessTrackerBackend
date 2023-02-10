const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const {
  getAllPublicRoutines,
  createRoutine,
  updateRoutine,
  getRoutineById,
  destroyRoutine,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
} = require("../db");
const {
  UnauthorizedError,
  UnauthorizedUpdateError,
  UnauthorizedDeleteError,
  DuplicateRoutineActivityError,
} = require("../errors");

// GET /api/routines
router.get("/", async (req, res, next) => {
  try {
    const routines = await getAllPublicRoutines();

    res.send(routines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
router.post("/", async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    res.status(401).send({
      error: UnauthorizedError(),
      message: UnauthorizedError(),
      name: "UnauthorizedError",
    });
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      const routine = await createRoutine({
        creatorId: id,
        isPublic,
        name,
        goal,
      });

      res.send(routine);
    } catch (error) {
      next(error);
    }
  }
});

// PATCH /api/routines/:routineId
router.patch("/:routineId", async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const { routineId } = req.params;

  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    res.status(401).send({
      error: UnauthorizedError(),
      message: UnauthorizedError(),
      name: "UnauthorizedError",
    });
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id, username } = jwt.verify(token, JWT_SECRET);
      let routine = await getRoutineById(routineId);

      if (id === routine.creatorId) {
        routine = await updateRoutine({ id: routineId, isPublic, name, goal });
        res.send(routine);
      } else {
        res.status(403).send({
          error: UnauthorizedUpdateError(),
          message: UnauthorizedUpdateError(username, routine.name),
          name: "UnauthorizedUpdateError",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
});

// DELETE /api/routines/:routineId
router.delete("/:routineId", async (req, res, next) => {
  const { routineId } = req.params;

  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    res.status(401).send({
      error: "UnauthorizedError",
      message: UnauthorizedError(),
      name: "UnauthorizedError",
    });
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id, username } = jwt.verify(token, JWT_SECRET);
      let routine = await getRoutineById(routineId);

      if (id === routine.creatorId) {
        routine = await destroyRoutine(routineId);
        res.send(routine);
      } else {
        res.status(403).send({
          error: "UnauthorizedDeleteError",
          message: UnauthorizedDeleteError(username, routine.name),
          name: "UnauthorizedDeleteError",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
});

// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, count, duration } = req.body;

  try {
    const routineActivities = await getRoutineActivitiesByRoutine({
      id: routineId,
    });
    let duplicate = false;
    for (let i = 0; i < routineActivities.length; i++) {
      const row = routineActivities[i];
      if (row.activityId === activityId) {
        duplicate = true;
        res.status(403).send({
          error: "DuplicateRoutineActivityError",
          message: DuplicateRoutineActivityError(routineId, activityId),
          name: "DuplicateRoutineActivityError",
        });
      }
    }
    if (!duplicate) {
      const activity = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      });
      res.send(activity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
