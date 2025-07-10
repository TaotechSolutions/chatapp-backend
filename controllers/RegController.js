const UserServices = require("../services/UserServices");
const { successResponse, errorResponse } = require("../utils/responses");
const jwt = require("jsonwebtoken");

const jwtCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const RegUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return errorResponse(res, 400, "Missing required fields");
    }

    const user = await UserServices.CreateUser({ username, email, password });
    const payload = { _id: user._id, email: user.email, status: user.status };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("auth_token", token, jwtCookieOptions);

    return successResponse(res, 201, "User registered", user);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Something went wrong");
  }
};


module.exports = { RegUser };