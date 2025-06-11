const express = require("express");
const passport = require("passport");
const userRoute = express.Router();

// Controllers
const UserController = require("../controllers/UserController");
const AuthController = require("../controllers/AuthController");

const { loginUser, logoutUser, oauthCallback, mustBeLoggedIn, 
  invalidMethod, getResetPasswordLink, userResetPassword
 } = AuthController;
const { getUserData } = UserController;

//local auth
userRoute.route("/login").post(loginUser).all(invalidMethod);
userRoute.route("/logout").post(logoutUser).all(invalidMethod);
userRoute.route("/forgot-password").post(getResetPasswordLink).all(invalidMethod);
userRoute.route("/reset-password").post(userResetPassword).all(invalidMethod);

// Google oAuth
userRoute
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }))
  .all(invalidMethod);
userRoute
  .route("/google/callback")
  .get(passport.authenticate("google", { session: false }), oauthCallback)
  .all(invalidMethod);

// GitHub OAuth
userRoute
  .route("/github")
  .get(passport.authenticate("github", { scope: ["user:email"] }))
  .all(invalidMethod);
userRoute
  .route("/github/callback")
  .get(passport.authenticate("github", { session: false }), oauthCallback)
  .all(invalidMethod);

// @ todo:fetch User data, separate auth route from user route
userRoute.route("/").get(mustBeLoggedIn, getUserData).all(invalidMethod);

module.exports = userRoute;