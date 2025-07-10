const express = require("express");
const passport = require("passport");
const AuthController = require("../controllers/AuthController");
const { RegUser } = require("../controllers/RegController");

const router = express.Router();
const {
  loginUser,
  logoutUser,
  oauthCallback,
  invalidMethod,
  getResetPasswordLink,
  userResetPassword,
  requestEmailVerification,
  verifyEmail,
} = AuthController;

router.route("/login").post(loginUser).all(invalidMethod);
router.route("/logout").post(logoutUser).all(invalidMethod);
router.route("/register").post(RegUser).all(invalidMethod);
router.route("/forgot-password").post(getResetPasswordLink).all(invalidMethod);
router.route("/reset-password").post(userResetPassword).all(invalidMethod);
router.route("/verify-email/:email").get(requestEmailVerification).all(invalidMethod);
router.route("/verify-email").post(verifyEmail).all(invalidMethod);

// Google OAuth
router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }))
  .all(invalidMethod);
router
  .route("/google/callback")
  .get(passport.authenticate("google", { session: false }), oauthCallback)
  .all(invalidMethod);

// GitHub OAuth
router
  .route("/github")
  .get(passport.authenticate("github", { scope: ["user:email"] }))
  .all(invalidMethod);
router
  .route("/github/callback")
  .get(passport.authenticate("github", { session: false }), oauthCallback)
  .all(invalidMethod);

module.exports = router;
