const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getAllActivities, createActivity, getActivityByName, getPublicRoutinesByActivity,updateActivity, getActivityById } = require('../db');
const { requireAuthentication, getToken } = require('./utils');
const { ActivityExistsError, UnauthorizedError, ActivityNotFoundError } = require("../errors");

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async(req, res, next) => {
    const { activityId } = req.params;

    try {
       const routines = await getPublicRoutinesByActivity({ id: activityId });

       if(!routines.length) {
        next({
            "error": "ActivityNotFoundError",
            "message": ActivityNotFoundError(activityId), 
            "name": "ActivityNotFoundError", 
            "status": 404
        });
       } else {
        res.send(routines);
       }

    } catch (error) {
        next(error);
    }
})

// GET /api/activities
router.get('/', async(req, res, next) =>{
    try {
        const activities = await getAllActivities();
        res.send(activities);
    } catch (error) {
        next(error);
    }
});

// POST /api/activities
router.post('/', requireAuthentication, async (req, res, next) => {
    const { name, description } = req.body;
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
            const duplicateName = await getActivityByName(name);

            if (duplicateName) {
                next({
                    "error": "ActivityExistsError",
                    "message": ActivityExistsError(name),
                    "name": "ActivityExistsError"
                });
            } else {
                const activity = await createActivity({ name, description });
                res.send(activity);
            }

        } catch (error) {
            next(error);
        }
    }
});

// PATCH /api/activities/:activityId
router.patch('/:activityId', requireAuthentication, async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;
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
            const existingActivity = await getActivityById(activityId)

            if(!existingActivity){
                next({
                    "error": "ActivityNotFoundError",
                    "message": ActivityNotFoundError(activityId), 
                    "name": "ActivityNotFoundError"
                }); 
            }

            const duplicateName = await getActivityByName(name);

            if(duplicateName) {
                next({
                    "error": "ActivityExistsError",
                    "message": ActivityExistsError(name), 
                    "name": "ActivityExistsError"
                }); 
            } else{
                const activity = await updateActivity({id: activityId, name, description})
                res.send(activity);
            }

            
        }catch (error){
            next(error)
        }
    }
});


module.exports = router;
