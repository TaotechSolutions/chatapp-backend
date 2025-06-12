const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    const err = new Error("Unauthorized: No token");
    err.statusCode = 401;
    return next(err);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // _id and email
    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

module.exports = authenticate;
