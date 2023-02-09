require("dotenv").config()
const express = require("express")
const cors = require('cors');
const morgan = require('morgan');
const app = express()

// Setup your Middleware and API Router here
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', require('./api')); 
app.use((req, res, next) => {
    const message = "This page cannot be found :)";
    res.status(404).send({ "message": message });
})

module.exports = app;
