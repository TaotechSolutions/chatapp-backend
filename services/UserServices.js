const User = require("../models/User");

class UserServices {
  static async findUserByData(data, showPassword = false) {
    try {
      const query = User.findOne(data);
      if (showPassword) query.select("+password");
      const userDoc = await query;
      return userDoc ? userDoc.toObject() : null;
    } catch (error) {
      throw error;
    }
  }
  static async findOrCreateUser(email, provider) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        emailVerified: true,
        authProvider: provider
      });
    }
    return user;
  }
  
    static async findUserById(id) {
    return await User.findById(id);
  }
  
}

module.exports = UserServices;