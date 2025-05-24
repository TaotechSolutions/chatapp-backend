const jwt = require("jsonwebtoken")

//signing new token for users
const signJWTToken = (payload, secret, duration) => {
    return new Promise(async (resolve, reject) => {
        try {
            const signedToken = jwt.sign(payload, secret, { expiresIn: duration })
            resolve(signedToken)
        } catch (error) {
            reject({ status: 401, error: error })
        }
    })
}

//verifying JWT token
const verifyJWTToken = (token, secret) => {
    return new Promise(async (resolve, reject) => {
        try {
            const verifiedUser = jwt.verify(token, secret)
            resolve({ status: 200, result: verifiedUser })
        } catch (error) {
            resolve({ status: 401, error: "Invalid Token! Token might have expired.", jwtError: error })
        }
    })
}

module.exports = { signJWTToken, verifyJWTToken }