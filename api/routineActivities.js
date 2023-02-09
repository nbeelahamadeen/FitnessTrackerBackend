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
const { UnauthorizedError, UnauthorizedUpdateError } = require("../errors");

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", async (req, res, next) => {
  const { routineActivityId } = req.params;
  const { count, duration } = req.body;
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
      const creator = await canEditRoutineActivity(routineActivityId, id);

      if (!creator) {
        const routineActivity = await getRoutineActivityById(routineActivityId)

        const routine = await getRoutineById(routineActivity.routineId);
        res.status(401).send({
          error: UnauthorizedUpdateError(),
          message: UnauthorizedUpdateError(username, routine.name),
          name: "UnauthorizedUpdateError",
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

module.exports = router;
