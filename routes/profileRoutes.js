const express = require("express");
const { mustBeLoggedIn, invalidMethod } = require("../controllers/AuthController");
const { findProfile, updateProfile, createProfile } = require("../controllers/ProfileController");

const router = express.Router();

router.route("/").post(mustBeLoggedIn, createProfile).all(invalidMethod);
router
  .route("/:userId")
  .get(mustBeLoggedIn, findProfile)
  .put(mustBeLoggedIn, updateProfile)
  .all(invalidMethod);

module.exports = router;
