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
const { requireAuthentication, getToken } = require('./utils');
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
router.post("/", requireAuthentication, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const token = getToken(req.header('Authorization'));
  const { id } = jwt.verify(token, JWT_SECRET);

  if (!id) {
    next({
      "error": "UnauthorizedError",
      "message": UnauthorizedError(),
      "name": "UnauthorizedError",
      "status": 401
    });
  } else {
    try {
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
router.patch("/:routineId", requireAuthentication, async (req, res, next) => {
  const { routineId } = req.params;
  const token = getToken(req.header('Authorization'));
  const { id, username } = jwt.verify(token, JWT_SECRET);

  if (!id) {
    next({
      "error": "UnauthorizedError",
      "message": UnauthorizedError(),
      "name": "UnauthorizedError",
      "status": 401
    });
  } else {
    try {
      let routine = await getRoutineById(routineId);

      if (id === routine.creatorId) {
        routine = await updateRoutine({ id: routineId, ...req.body});
        res.send(routine);
      } else {
        next({
          error: "UnauthorizedUpdateError",
          message: UnauthorizedUpdateError(username, routine.name),
          name: "UnauthorizedUpdateError",
          status: 403
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
});

// DELETE /api/routines/:routineId
router.delete("/:routineId", requireAuthentication, async (req, res, next) => {
  const { routineId } = req.params;
  const token = getToken(req.header('Authorization'));
  const { id, username } = jwt.verify(token, JWT_SECRET);

  if (!id) {
    next({
      "error": "UnauthorizedError",
      "message": UnauthorizedError(),
      "name": "UnauthorizedError",
      "status": 401
    });
  } else {
    try {
      let routine = await getRoutineById(routineId);

      if (id === routine.creatorId) {
        routine = await destroyRoutine(routineId);
        res.send(routine);
      } else {
        next({
          error: "UnauthorizedDeleteError",
          message: UnauthorizedDeleteError(username, routine.name),
          name: "UnauthorizedDeleteError",
          status: 403
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
        next({
          error: "DuplicateRoutineActivityError",
          message: DuplicateRoutineActivityError(routineId, activityId),
          name: "DuplicateRoutineActivityError",
          status: 403
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
