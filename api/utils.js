const { UnauthorizedError } = require("../errors");

const requireUser = (req, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) {
        next({status: 401, message: "You must supply a username and password."});
    } else {
        next();
    }
}

const requireAuthentication = (req, res, next) => {
    const auth = req.header('Authorization');
    if(!auth) {
        next({
            "error": "UnauthorizedError",
            "message": UnauthorizedError(), 
            "name": "UnauthorizedError",
            "status": 401
        }); 
    } else {
        next();
    }
}

const getToken = (str) => {
    const prefix = 'Bearer ';
    const token = str.slice(prefix.length);
    return token;
}


module.exports = {
    requireUser,
    requireAuthentication,
    getToken,
}