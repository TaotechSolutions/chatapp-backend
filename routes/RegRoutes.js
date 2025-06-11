const express = require("express");
const router = express.Router();

// Import the controller function
const { RegUser } = require("../controllers/RegController");

router.post("/register", RegUser);

module.exports = router;