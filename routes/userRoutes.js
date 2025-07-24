const express = require("express");
const userRoute = express.Router();

const { mustBeLoggedIn, invalidMethod } = require("../controllers/AuthController");

const { getUserData } = require("../controllers/UserController");

userRoute.route("/").get(mustBeLoggedIn, getUserData).all(invalidMethod);

module.exports = userRoute;
