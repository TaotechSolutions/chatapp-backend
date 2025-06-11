const UserServices = require("../services/UserServices");
const { errorResponse, successResponse } = require("../utils/responses");
const { loginUserSchema, mongoIdSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validators/auth");
const { verifyHash, hashValue, cleanHash, isExpired, extendDate, compareDate } = require("../utils/helpers");
const { signJWTToken, verifyJWTToken } = require("../middlewares/TokenProvider");
const EmailBluePrint = require("../utils/EmailBlueprint");
const EmailServices = require("../services/EmailServices");
const { JWT_SECRET, Api_consumer_URL, MAX_RESET_ATTEMPTS, RESET_TOKEN_EXPIRY } = process.env;


const jwtCookieOptions = {
  httpOnly: true, // inaccessible to JavaScript (prevents XSS)
  secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
  sameSite: "strict", // prevent CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

class AuthController {
  static async invalidMethod(req, res) {
    return errorResponse(res, 405, "Method not allowed", null, null);
  }

  static async mustBeLoggedIn(req, res, next) {
    try {
      const bearerToken = req.cookies?.auth_token;
      if (!bearerToken) {
        return errorResponse(res, 401, "Authentication token is missing.");
      }
      const verifiedUser = await verifyJWTToken(bearerToken, JWT_SECRET); //verifying the token generated when logging in
      if (verifiedUser.status !== 200)
        return errorResponse(
          res,
          verifiedUser.status,
          verifiedUser.error,
          null,
          verifiedUser.jwtError
        );

      const apiUser = verifiedUser?.result;
      const userId = apiUser?._id;
      const userStatus = apiUser?.status;

      const { value, error } = mongoIdSchema.validate({ id: userId });
      if (error) return errorResponse(res, 400, error?.details[0]?.message);

      //checking if user account was deactivated by Admin
      const user = await UserServices.findUserByData({ _id: userId });
      if (!user) return errorResponse(res, 404, "User with that token not found!", null);
      const userSavedStatus = user.status;

      if (userStatus !== userSavedStatus) {
        return errorResponse(res, 403, "Your Account was deactivated. Please contact Support");
      } else {
        req.apiUser = apiUser;
        req.userId = apiUser._id;
        req.userDetails = user;
        next();
      }
    } catch (error) {
      console.log(error);
      next(error)
    }
  }

  static async loginUser(req, res, next) {
    try {
      const { value, error } = loginUserSchema.validate(req.body);
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const user = await UserServices.findUserByData(
        { email: value?.email.toLowerCase().trim() },
        true
      );
      if (!user) return errorResponse(res, 404, "User not found", null);
      const isValid = await verifyHash(value.password, user.password);

      if (!isValid) {
        return errorResponse(res, 401, "Invalid Email or Password", null, {
          password: ["Incorrect Password"],
        });
      }

      const { emailVerified, status, _id } = user;
      if (status === "deactivated")
        return errorResponse(
          res,
          401,
          "Your account has been deactivated. Contact customer care for assistance."
        );

      if (!emailVerified) {
        await errorResponse(res, 401, `Email not verified, please verify your email to proceed.`, {
          emailVerified: false,
        });
        return;
      }

      const userData = {
        _id: _id,
        email: user.email,
        status: "activated",
        role: user.role,
      };

      const token = await signJWTToken(userData, JWT_SECRET, "7d");

      // Set token as HTTP-only cookie
      res.cookie("auth_token", token, jwtCookieOptions);

      delete user.password;
      delete user?.resetToken;
      await successResponse(res, 200, "Login successful", { user });
    } catch (error) {
      console.log(error);
      next(error)
    }
  }

  static async logoutUser(req, res) {
    const token = req.cookies?.auth_token;

    if (!token) return errorResponse(res, 401, "Unauthorized: No auth token found");

    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(res, 200, "Logged out successfully");
  }

  static async oauthCallback(req, res) {
    if (!req.user || !req.user._id || !req.user.email) {
      return errorResponse(res, 400, "OAuth callback failed: User data missing.");
    }
    const token = signJWTToken({ _id: req.user._id, email: req.user.email }, JWT_SECRET, "7d");

    res.cookie("auth_token", token, jwtCookieOptions);

    // If request is from SPA expecting JSON (e.g., frontend redirect handler)
    if (req.headers.accept?.includes("application/json")) {
      return successResponse(res, 200, "OAuth login successful", req.user);
    }
    // Otherwise, it's a traditional browser redirect flow
    res.redirect(process.env.FRONTEND_REDIRECT_URL);
  }

  static async getResetPasswordLink(req, res, next) {
    try {
      const { value, error } = forgotPasswordSchema.validate(req.body);
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const { email } = value;
      const userByEmail = await UserServices.findUserByData({ email: email.toLowerCase().trim() }, true)
      if (!userByEmail) return errorResponse(res, 404, 'Email is not found.');
      if (userByEmail?.oauthProvider !== "local") return errorResponse(res, 403, 'Password reset is unavailable as your account was created using Google Sign-In. Please use Google to log in.');
      if (!userByEmail?.emailVerified) return errorResponse(res, 403, 'Verification failed, Email is not verified.');
      const { _id, password, resetCount = 0, resetDate } = userByEmail;
      const isResetToday = compareDate(new Date(), resetDate);
      if (resetCount >= Number(MAX_RESET_ATTEMPTS) && isResetToday) return errorResponse(res, 403, 'Password reset is unavailable as you have exceeded the maximum number of attempts. Try again after 24 hours.');

      const secret = JWT_SECRET + password  // to make the reset url invalid after password change
      const payload = { email: userByEmail.email, _id }

      const token = await signJWTToken(payload, secret, RESET_TOKEN_EXPIRY)
      let data = { resetToken: token, resetCount: resetCount + 1, resetDate: new Date() }
      if (resetCount >= Number(MAX_RESET_ATTEMPTS) && !isResetToday) { data = { ...data, resetCount: 1 } }
      await UserServices.updateUser(_id, data)
      let hashVal = await hashValue(token)
      hashVal = await cleanHash(hashVal, token)
      const resetLink = `${Api_consumer_URL}/auth/reset-password/${_id}/${hashVal}`
      successResponse(res, 200, "Password reset link sent to your email address.");

      // Send user email
      const emailData = {
        email: userByEmail.email,
        emailToBeSent, emailHead: "Reset Password",
        emailSubject: "Reset password Request."
      }
      const emailToBeSent = EmailBluePrint.returnResetPasswordHTML(userByEmail, resetLink, "request") //return HTML email to be sent
      await EmailServices.sendingEmailToUser(emailData)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  static async userResetPassword(req, res, next) {
    try {
      const { value, error } = resetPasswordSchema.validate(req.body);
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const { userId, password, token } = value;
      const user = await UserServices.findUserByData({ _id: userId }, true)
      if (!user) return errorResponse(res, 404, 'User not found.');
      const isValid = await verifyHash(user.resetToken, token)
      if (!isValid) { return errorResponse(res, 403, "Invalid reset link!") }
      const secret = JWT_SECRET + user.password
      const forgottenUser = await verifyJWTToken(user.resetToken, secret)
      if (forgottenUser.status !== 200) return errorResponse(res, forgottenUser.status, forgottenUser.error);
      const foundUserId = forgottenUser.result._id
      const newPassword = await hashValue(password)
      const updatedUser = await UserServices.updateUser(foundUserId, { password: newPassword, resetToken: "", resetCount: 0 })
      successResponse(res, 200, "Password reset successful.");

      // Send user email
      const emailData = {
        email: updatedUser.email,
        emailToBeSent, emailHead: "Password Changed!",
        emailSubject: "Your account password changed successfully."
      }
      const emailToBeSent = EmailBluePrint.returnResetPasswordHTML(updatedUser, "", "success") //return HTML email to be sent
      await EmailServices.sendingEmailToUser(emailData)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = AuthController;
