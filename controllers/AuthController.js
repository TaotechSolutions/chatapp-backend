const UserServices = require("../services/UserServices");
const { errorResponse, successResponse } = require("../utils/responses");
const { loginUserSchema, mongoIdSchema } = require("../validators/auth")
const { verifyHash } = require("../utils/helpers");
const { signJWTToken, verifyJWTToken } = require("../middlewares/TokenProvider");
const { JWT_SECRET } = process.env


class AuthController {
    static async invalidMethod(req, res) {
        return errorResponse(res, 405, "Method not allowed", null, null);
    }

    static async mustBeLoggedIn(req, res, next) {
        try {
            const bearerHeader = req.headers["authorization"]
            const bearerToken = bearerHeader?.split(" ")[1]
            const verifiedUser = await verifyJWTToken(bearerToken, process.env.JWT_SECRET) //verifying the token generated when logging in
            if (verifiedUser.status !== 200) return errorResponse(res, verifiedUser.status, verifiedUser.error, null, verifiedUser.jwtError);

            const apiUser = verifiedUser?.result
            const userId = apiUser?._id
            const userStatus = apiUser?.status

            const { value, error } = mongoIdSchema.validate({ id: userId });
            if (error) return errorResponse(res, 400, error?.details[0]?.message);

            //checking if user account was deactivated by Admin
            const user = await UserServices.findUserByData({ _id: userId })
            if (!user) return errorResponse(res, 404, "User with that token not found!", null);
            const userSavedStatus = user.status

            if (userStatus !== userSavedStatus) {
                return errorResponse(res, 401, "Your Account was deactivated. Please contact Customer Care.");
            } else {
                req.apiUser = apiUser
                req.userId = apiUser._id
                req.userDetails = user
                next()
            }
        } catch (error) {
            console.log(error)
            return errorResponse(res, 401, "You must be logged in to perform that action!", "", error)
        }
    }

    static async loginUser(req, res) {
        try {
            const { value, error } = loginUserSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error?.details[0]?.message);
            const user = await UserServices.findUserByData({ email: value?.email.toLowerCase().trim() }, true);
            if (!user) return errorResponse(res, 404, "User not found", null);
            const isValid = await verifyHash(value.password, user.password)
            if (!user || !isValid) {
                return errorResponse(res, 401, "Invalid Email or Password", null,
                    {
                        "email": user ? [] : ["Incorrect Email Address"],
                        "password": ["Incorrect Password"]
                    }
                );
            }

            const { emailVerified, status, _id } = user
            if (status === "deactivated") return errorResponse(res, 401, 'Your account has been deactivated. Contact customer care for assistance.');

            if (!emailVerified) {
                await errorResponse(res, 401,
                    `Email not verified, please verify your email to proceed.`,
                    { emailVerified: false }
                );
                return;
            };

            const userData = {
                _id: _id,
                email: user.email,
                status: "activated",
                role: user.role
            }

            const token = await signJWTToken(userData, JWT_SECRET, "7d");
            delete user.password
            await successResponse(res, 200, "Login successful", { user, token });
        } catch (error) {
            console.log(error)
            return errorResponse(res, 500, "An error has occurred. Please try again later", null, error);
        }
    }
}


module.exports = AuthController;