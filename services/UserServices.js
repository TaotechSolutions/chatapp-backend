const User = require("../models/User");

class UserServices {
  static async findUserByData(data, showPassword = false) {
    //changed variable name from user => query, adjusted  try block for schema modifications
    try {
      const query = User.findOne(data);
      if (showPassword) query.select("+password");
      const userDoc = await query;
      return userDoc ? userDoc.toObject() : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserServices;