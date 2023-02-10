const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const {
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
  getRoutineById,
  getRoutineActivityById,
} = require("../db");
const { requireAuthentication, getToken } = require('./utils');
const { UnauthorizedError, UnauthorizedUpdateError, UnauthorizedDeleteError } = require("../errors");

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", requireAuthentication, async (req, res, next) => {
  const { routineActivityId } = req.params;
  const { count, duration } = req.body;
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
      const creator = await canEditRoutineActivity(routineActivityId, id);

      if (!creator) {
        const routineActivity = await getRoutineActivityById(routineActivityId);
        const routine = await getRoutineById(routineActivity.routineId);

        next({
          error: "UnauthorizedUpdateError",
          message: UnauthorizedUpdateError(username, routine.name),
          name: "UnauthorizedUpdateError",
          status: 403
        });

      } else {
        const update = await updateRoutineActivity({
          id: routineActivityId,
          count,
          duration,
        });
        res.send(update);
      }
    } catch (error) {
      next(error);
    }
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireAuthentication, async (req, res, next) => {
  const { routineActivityId } = req.params;
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

      const creator = await canEditRoutineActivity(routineActivityId, id);

      if (!creator) {
        const routineActivity = await getRoutineActivityById(routineActivityId)

        const routine = await getRoutineById(routineActivity.routineId);
        next({
          error: "UnauthorizedDeleteError",
          message: UnauthorizedDeleteError(username, routine.name),
          name: "UnauthorizedDeleteError",
          status: 403
        });

      } else {
        const remove = await destroyRoutineActivity(routineActivityId);
        res.send(remove);
      }
    } catch (error) {
      next(error);
    }
  }
});


module.exports = router;
