const express = require("express");
const userRoute = express.Router();
const cors = require("cors");
const { all, methods } = require('./allowedURLs')

userRoute.use(cors({
    origin: "*",  // origin can be set to specific domains, or "*" for all domains
    methods
}))


// Controllers
const UserController = require('../controllers/UserController')
const AuthController = require('../controllers/AuthController')
const { loginUser, mustBeLoggedIn } = AuthController
const { getUserData } = UserController;


userRoute.route("/login")
    .post(loginUser);

userRoute.route("/")
    .get(mustBeLoggedIn, getUserData)



module.exports = userRoute;