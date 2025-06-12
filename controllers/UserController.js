const { successResponse } = require("../utils/responses");

class UserController {
  static async getUserData(req, res) {
    return successResponse(res, 200, "User data fetched successfully", req.user);
  }
}

module.exports = UserController;
