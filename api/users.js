/* eslint-disable no-useless-catch */
const express = require("express");
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const {
    UserTakenError,
    PasswordTooShortError,
    UnauthorizedError,
  } = require("../errors");

const { createUser, getUserByUsername, getUser } = require('../db');
const client = require("../db/client");

// POST /api/users/register
userRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const duplicateUser = await getUserByUsername(username);

        if(duplicateUser) {
            res.send({
                "error": "UserTakenError",
                "message": UserTakenError(username),
                "name": username
            });
        }

        if(password.length < 8) {
            res.send({
                "error": 'PasswordTooShort',
                "message": PasswordTooShortError(), 
                "name": username
            })
        }
        
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
         
    } catch (error) {
      next(error); 
    }
})

// POST /api/users/login
userRouter.post('/login', async (req, res, next) =>{
    const { username, password } = req.body;

    try {
        if(username && password){
            const user = await getUser({username, password});

            const token = jwt.sign({
                id: user.id,
                username}, 
                process.env.JWT_SECRET
            );

            res.send({
                "user": user,
                "message":"you're logged in!",
                "token": token
            })
        }
    

    } catch (error) {
        next(error);
    }
})
// GET /api/users/me

// GET /api/users/:username/routines

module.exports = userRouter;
