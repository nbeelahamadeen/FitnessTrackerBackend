const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getAllPublicRoutines, createRoutine } = require('../db');
const { UnauthorizedError } = require("../errors");


// GET /api/routines
router.get('/', async (req, res, next) => {
    try {
        const routines = await getAllPublicRoutines();

        res.send(routines);
    } catch (error) {
        next(error);
    }
})

// POST /api/routines
router.post('/', async (req, res, next) => {
    const { isPublic, name, goal } = req.body;
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    if (!auth) {
        res.status(401).send({
            "error": UnauthorizedError(),
            "message": UnauthorizedError(),
            "name": "UnauthorizedError"
        });
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);
        try {
            const { id } = jwt.verify(token, JWT_SECRET);
            const routine = await createRoutine({ creatorId: id, isPublic, name, goal });

            res.send(routine);
        } catch (error) {
            next(error);
        }
    }
})

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
