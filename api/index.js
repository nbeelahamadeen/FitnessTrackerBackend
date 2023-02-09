const express = require('express');
const router = express.Router();

// GET /api/health
router.get('/health', async (req, res, next) => {
    res.send({ message: "Server is healthy!"});
});

// GET /api/unknown
// router.get('/unknown', async (err, req, res, next) => {
//     let message = "This page cannot be found";
//     console.log( typeof message);
//     res.status(err.status || 404).send({ "message": message });
// })

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

module.exports = router;
