const UserServices = require("../services/UserServices");
const { successResponse } = require("../utils/responses");

class UserController {
  static async getUserData(req, res, next) {
    console.log(req.user);
    return successResponse(res, 200, "User data fetched successfully", req.user);
  }
}

module.exports = UserController;
