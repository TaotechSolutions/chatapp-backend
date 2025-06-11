const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
const User = require("../models/Register.js"); 

const jwtCookieOptions = {
  httpOnly: true, // inaccessible to JavaScript (prevents XSS)
  secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
  sameSite: "strict", // prevent CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


const user =[];
const RegUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).send("Missing username, password, or email.");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const userData = {
        email: User.email,
        username: User.username,
        status: "activated"
      };

    // JWT token generation  
    const token = jwt.sign({ userData }, 'test#secret', { expiresIn: '1h' });
    res.cookie('authToken', token, { httpOnly: true, secure: true });

    res.status(201).send({ message: "User registered"}, { user });
  } catch (error) {
    console.error("Error in RegUser:", error);
    res.status(500).send("Something went wrong.");
  }
};


module.exports = { RegUser };