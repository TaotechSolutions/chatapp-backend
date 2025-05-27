const jwt = require("jsonwebtoken")

//sign and verify(sync with try/catch)  (sign, verify) are synchronous — wrapping them in Promises adds unnecessary complexity.
const signJWTToken = (payload, secret, duration) =>
  jwt.sign(payload, secret, { expiresIn: duration });

const verifyJWTToken = (token, secret) => {
  try {
    const verified = jwt.verify(token, secret);
    return { status: 200, result: verified };
  } catch (err) {
    return { status: 401, error: "Invalid Token", jwtError: err };
  }
};

module.exports = { signJWTToken, verifyJWTToken }