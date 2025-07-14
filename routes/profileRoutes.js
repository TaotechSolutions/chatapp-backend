const express = require("express");
const { mustBeLoggedIn, invalidMethod } = require("../controllers/AuthController");
const { findProfile, updateProfile, createProfile, getUserProfile } = require("../controllers/ProfileController");

const router = express.Router();
router.use(mustBeLoggedIn)

router.route("/")
  .get(getUserProfile).all(invalidMethod)
  .post(createProfile).all(invalidMethod);

router
  .route("/:userId")
  .get(findProfile)
  .put(updateProfile)
  .all(invalidMethod);


module.exports = router;
