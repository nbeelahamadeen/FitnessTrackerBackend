/* eslint-disable no-useless-catch */
const express = require("express");
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { requireUser, requireAuthentication, getToken } = require('./utils');

const {
    UserTakenError,
    PasswordTooShortError,
    UnauthorizedError,
  } = require("../errors");

const { createUser, getUserByUsername, getUser, getUserById, 
    getPublicRoutinesByUser, getAllRoutinesByUser } = require('../db');

// POST /api/users/register
userRouter.post('/register', requireUser, async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const duplicateUser = await getUserByUsername(username);

        if(duplicateUser) {
            next({
                "error": "UserTakenError",
                "message": UserTakenError(username),
                "name": username
            });
        }

        else if(password.length < 8) {
            next({
                "error": 'PasswordTooShort',
                "message": PasswordTooShortError(), 
                "name": username
            })
        }
        
        else {
            const user = await createUser({username, password});
            const token = jwt.sign({
                id: user.id,
                username}, 
                process.env.JWT_SECRET
            );

            res.send({
                "message": "Thank you for signing up", 
                "token": token,
                "user": user
            });
        }
         
    } catch (error) {
      next(error); 
    }
})

// POST /api/users/login
userRouter.post('/login', requireUser, async (req, res, next) =>{
    const { username, password } = req.body;

    try {
        const user = await getUser({ username, password });

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            "user": user,
            "message": "you're logged in!",
            "token": token
        })
    } catch (error) {
        next(error);
    }
})

// GET /api/users/me
userRouter.get('/me', requireAuthentication, async (req, res, next) => {
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
            const user = await getUserById(id);
            res.send(user);
        } catch (error) {
            next(error);
        }
    }
    
})
// GET /api/users/:username/routines
userRouter.get('/:username/routines', async (req, res, next) => {
    const { username } = req.params; 
    const auth = req.header('Authorization');
    const prefix = 'Bearer ';

    if(!auth) {
        const publicRoutines = await getPublicRoutinesByUser({ username });
        res.send(publicRoutines);

    } else if (auth.startsWith(prefix)) {
        const token = getToken(auth);
        const { username: loggedIn } = jwt.verify(token, JWT_SECRET);

        try {  

            if(username === loggedIn){
                const allRoutines = await getAllRoutinesByUser({ username });
                res.send(allRoutines);
            }else{
                const publicRoutines = await getPublicRoutinesByUser({ username });
                res.send(publicRoutines);
            } 

        } catch (error) {
            next(error);
        }
}})

module.exports = userRouter;
