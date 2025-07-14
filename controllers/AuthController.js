const UserServices = require("../services/UserServices");
const { errorResponse, successResponse } = require("../utils/responses");
const {
  loginUserSchema,
  mongoIdSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  registrationSchema,
} = require("../validators/auth");
const {
  verifyHash,
  hashValue,
  cleanHash,
  isExpired,
  extendDate,
  compareDate,
} = require("../utils/helpers");
const { signJWTToken, verifyJWTToken } = require("../middlewares/TokenProvider");
const EmailBluePrint = require("../utils/EmailBlueprint");
const EmailServices = require("../services/EmailServices");
const { JWT_SECRET, Api_consumer_URL, MAX_RESET_ATTEMPTS,
  RESET_TOKEN_EXPIRY, VERIFY_EMAIL_EXPIRY
} = process.env;

const isProduction = process.env.NODE_ENV === "production";

const jwtCookieOptions = rememberMe => {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Strict",
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days or session
  };
};

class AuthController {
  static async invalidMethod(req, res) {
    return errorResponse(res, 405, "Method not allowed", null, null);
  }

  static async mustBeLoggedIn(req, res, next) {
    try {
      // Try Authorization header first (fallback)
      let token;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        console.log("🔐 Using Bearer token from Authorization header");
      } else if (req.cookies?.auth_token) {
        token = req.cookies.auth_token;
        console.log("🔐 Using token from HttpOnly cookie");
      }

      if (!token) {
        return errorResponse(res, 401, "Authentication token is missing.");
      }

      const verifiedUser = await verifyJWTToken(token, JWT_SECRET); //verifying the token generated when logging in
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
        req.user = user; //standardized
        req.userId = user?._id
        next();
      }
    } catch (error) {
      console.log(error);
      next(error);
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

      const token = await signJWTToken(userData, JWT_SECRET, value.rememberMe ? "7d" : undefined);

      // Set token as HTTP-only cookie
      res.cookie("auth_token", token, jwtCookieOptions(value.rememberMe));

      delete user.password;
      delete user?.resetToken;
      return successResponse(res, 200, "Login successful", { user });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async logoutUser(req, res) {
    res.clearCookie("auth_token", jwtCookieOptions());
    return successResponse(res, 200, "Logged out successfully");
  }

  static async oauthCallback(req, res) {
    if (!req.user || !req.user._id || !req.user.email) {
      return errorResponse(res, 400, "OAuth callback failed: User data missing.");
    }

    const token = signJWTToken(
      { _id: req.user._id, email: req.user.email, status: req.user.status },
      JWT_SECRET,
      "7d"
    );

    res.cookie("auth_token", token, jwtCookieOptions(true));

    // Log what Set-Cookie header is sent
    const setCookieHeader = res.getHeader("Set-Cookie");
    console.log("Set-Cookie header:", setCookieHeader);

    // Instead of redirecting, send a postMessage back to opener window
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");

    res.send(`
  <html>
    <body>
      <script>
        try {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', token: '${token}' }, '*');
        } catch (e) {
          console.warn("Failed to postMessage:", e);
        }
        window.close();
      </script>
    </body>
  </html>
`);
  }

  static async register(req, res, next) {
    try {
      if (!req?.body) return errorResponse(res, 400, "Invalid request body");
      let { value, error } = registrationSchema.validate(req.body);
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const userExist = await UserServices.findUserByData({ email: value.email });
      if (userExist) return errorResponse(res, 400, "Email already exists");
      const user = await UserServices.CreateUser(value);

      const payload = { email: user?.email, _id: user?._id }
      const secret = JWT_SECRET + user._id.toString()
      const token = await signJWTToken(payload, secret, VERIFY_EMAIL_EXPIRY);
      await UserServices.updateUser(user._id, { resetToken: token });
      let hashVal = await hashValue(token);
      hashVal = await cleanHash(hashVal, token);
      const verifyLink = `${Api_consumer_URL}/verify/email/${user._id}/${hashVal}`;
      const emailToBeSent = EmailBluePrint.returnEmailVerificationHTML(user, verifyLink); //return HTML email to be sent
      const emailData = {
        email: user.email,
        emailToBeSent,
        emailHead: "Verify Your Email",
        emailSubject: "Verify your email address",
      }
      successResponse(res, 201, "Registration Successful. Email verification link sent to your email.", { email: user?.email, username: user?.username, _id: user?._id, emailVerified: false });
      await EmailServices.sendingEmailToUser(emailData);
    } catch (error) {
      console.error(error);
      next(error)
    }
  };

  static async getResetPasswordLink(req, res, next) {
    try {
      const { value, error } = forgotPasswordSchema.validate(req.body);
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const { email } = value;
      const userByEmail = await UserServices.findUserByData(
        { email: email.toLowerCase().trim() },
        true
      );
      if (!userByEmail) return errorResponse(res, 404, "Email is not found.");
      if (userByEmail?.oauthProvider !== "local")
        return errorResponse(
          res,
          403,
          "Password reset is unavailable as your account was created using Google Sign-In. Please use Google to log in."
        );
      if (!userByEmail?.emailVerified)
        return errorResponse(res, 403, "Password Reset Failed, Email is not verified.");
      const { _id, password, resetCount = 0, resetDate } = userByEmail;
      const isResetToday = compareDate(new Date(), resetDate);
      if (resetCount >= Number(MAX_RESET_ATTEMPTS) && isResetToday)
        return errorResponse(
          res,
          403,
          "Password reset is unavailable as you have exceeded the maximum number of attempts. Try again after 24 hours."
        );

      const secret = JWT_SECRET + password; // to make the reset url invalid after password change
      const payload = { email: userByEmail.email, _id };

      const token = await signJWTToken(payload, secret, RESET_TOKEN_EXPIRY);
      let data = { resetToken: token, resetCount: resetCount + 1, resetDate: new Date() };
      if (resetCount >= Number(MAX_RESET_ATTEMPTS) && !isResetToday) {
        data = { ...data, resetCount: 1 };
      }
      await UserServices.updateUser(_id, data);
      let hashVal = await hashValue(token);
      hashVal = await cleanHash(hashVal, token);
      const resetLink = `${Api_consumer_URL}/auth/reset-password/${_id}/${hashVal}`;
      successResponse(res, 200, "Password reset link sent to your email address.");

      const emailToBeSent = EmailBluePrint.returnResetPasswordHTML(
        userByEmail,
        resetLink,
        "request"
      ); //return HTML email to be sent

      // Send user email
      const emailData = {
        email: userByEmail.email,
        emailToBeSent,
        emailHead: "Reset Password",
        emailSubject: "Reset password Request.",
      };
      await EmailServices.sendingEmailToUser(emailData);
    } catch (error) {
      next(error);
    }
  }

  static async userResetPassword(req, res, next) {
    try {
      const { value, error } = resetPasswordSchema.validate(req.body);
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const { userId, password, token } = value;
      const user = await UserServices.findUserByData({ _id: userId }, true);
      if (!user) return errorResponse(res, 404, "User not found.");
      const isValid = await verifyHash(user.resetToken, token);
      if (!isValid) {
        return errorResponse(res, 403, "Invalid reset link!");
      }
      const secret = JWT_SECRET + user.password;
      const forgottenUser = await verifyJWTToken(user.resetToken, secret);
      if (forgottenUser.status !== 200)
        return errorResponse(res, forgottenUser.status, forgottenUser.error);
      const foundUserId = forgottenUser.result._id;
      const newPassword = await hashValue(password);
      const updatedUser = await UserServices.updateUser(foundUserId, {
        password: newPassword,
        resetToken: "",
        resetCount: 0,
      });
      successResponse(res, 200, "Password reset successful.");

      // Send user email
      const emailToBeSent = EmailBluePrint.returnResetPasswordHTML(updatedUser, "", "success"); //return HTML email to be sent
      const emailData = {
        email: updatedUser.email,
        emailToBeSent,
        emailHead: "Password Changed!",
        emailSubject: "Your account password changed successfully.",
      };
      await EmailServices.sendingEmailToUser(emailData);
    } catch (error) {
      next(error);
    }
  }

  static async requestEmailVerification(req, res, next) {
    try {
      const email = req.params?.email
      const { value, error } = forgotPasswordSchema.validate({ email });
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const user = await UserServices.findUserByData({ email: value.email.toLowerCase().trim() })
      if (!user) return errorResponse(res, 404, 'Email is not found.', null);
      if (user.emailVerified) return errorResponse(res, 403, 'Email is already verified.');
      const payload = { email: user.email, _id: user._id }
      const secret = JWT_SECRET + user._id.toString()
      const token = await signJWTToken(payload, secret, VERIFY_EMAIL_EXPIRY);
      await UserServices.updateUser(user._id, { resetToken: token });
      let hashVal = await hashValue(token);
      hashVal = await cleanHash(hashVal, token);
      const verifyLink = `${Api_consumer_URL}/verify/email/${user._id}/${hashVal}`;
      const emailToBeSent = EmailBluePrint.returnEmailVerificationHTML(user, verifyLink); //return HTML email to be sent
      const emailData = {
        email: user.email,
        emailToBeSent,
        emailHead: "Verify Your Email",
        emailSubject: "Verify your email address",
      }
      successResponse(res, 200, "Email verification link sent to your email.");
      await EmailServices.sendingEmailToUser(emailData);
    } catch (error) {
      next(error)
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { value, error } = verifyEmailSchema.validate(req.body);
      if (error) return errorResponse(res, 400, error?.details[0]?.message);
      const { userId, token } = value;
      const user = await UserServices.findUserByData({ _id: userId });
      if (!user) return errorResponse(res, 404, 'User not found.');
      if (user.emailVerified) return successResponse(res, 200, 'Email is already verified.');
      const isValid = await verifyHash(user.resetToken, token);
      if (!isValid) return errorResponse(res, 403, "Invalid verification link!");
      const secret = JWT_SECRET + userId;
      const requestingUser = await verifyJWTToken(user.resetToken, secret);
      if (requestingUser.status !== 200) return errorResponse(res, requestingUser.status, requestingUser.error);
      await UserServices.updateUser(userId, { emailVerified: true, resetToken: "" });
      return successResponse(res, 200, "Email verified successfully");
    } catch (error) {
      next(error)
    }
  }
}

module.exports = AuthController;
