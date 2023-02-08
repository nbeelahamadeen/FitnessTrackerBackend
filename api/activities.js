const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getAllActivities, createActivity, getActivityByName, getPublicRoutinesByActivity,updateActivity, getActivityById } = require('../db');
const { ActivityExistsError, UnauthorizedError, ActivityNotFoundError } = require("../errors");

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async(req, res, next) => {
    const { activityId } = req.params;
    //still not passing the list of routines
    console.log(activityId);
    try {
       const routines = await getPublicRoutinesByActivity({ id: activityId });
       console.log(routines);

       if(!routines.length) {
        res.status(404).send({
            "error": ActivityNotFoundError(),
            "message": ActivityNotFoundError(activityId), 
            "name": "ActivityNotFoundError"
        });
       } 

       res.send(routines);

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
router.post('/', async(req, res, next) => {
    const { name, description } = req.body;
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    if(!auth) {
        res.status(401).send({
            "error": UnauthorizedError(),
            "message": UnauthorizedError(), 
            "name": "UnauthorizedError"
        });
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);
    
        try {
            const { id } = jwt.verify(token, JWT_SECRET);
            const duplicateName = await getActivityByName(name);

            if(duplicateName) {
                res.status(500).send({
                    "error": ActivityExistsError(),
                    "message": ActivityExistsError(name), 
                    "name": "ActivityExistsError"
                }); 
            }

            const activity = await createActivity({ name, description });
            res.send(activity);
            
        } catch (error) {
            next(error);
        }
    }
});

// PATCH /api/activities/:activityId
router.patch('/:activityId', async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;

    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    if(!auth) {
        res.status(401).send({
            "error": UnauthorizedError(),
            "message": UnauthorizedError(), 
            "name": "UnauthorizedError"
        });
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);
    
        try {
            // const { id } = jwt.verify(token, JWT_SECRET);
            const existingActivity = await getActivityById(activityId)

            if(!existingActivity){
                res.status(500).send({
                    "error": ActivityNotFoundError(),
                    "message": ActivityNotFoundError(activityId), 
                    "name": "ActivityNotFoundError"
                }); 
            }

            const duplicateName = await getActivityByName(name);

            if(duplicateName) {
                res.status(500).send({
                    "error": ActivityExistsError(),
                    "message": ActivityExistsError(name), 
                    "name": "ActivityExistsError"
                }); 
            } else{
                const activity = await updateActivity({id: activityId, name, description})
                console.log("Updated Activity")
                console.log(activity);
                res.send(activity);
            }

            
        }catch (error){
            next(error)
        }
    }
})


module.exports = router;
