const UserServices = require("../services/UserServices");
const { successResponse } = require("../utils/responses");

class UserController {
  static async getUserData(req, res, next) {
    try {
      if (!req.user || !req.user._id) {
        const error = new Error("Unauthorized: No user ID found in request");
        error.statusCode = 401;
        return next(error);
      }

      const user = await UserServices.findUserById(req.user._id);

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
      }

      return successResponse(res, 200, "User data fetched successfully", user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
