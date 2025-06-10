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

  static async findOrCreateUser(email, profileData = {}, provider = "google") {
    if (!email) throw new Error("Email is required");
    let user = await User.findOne({ email });

    if (user) {
      // Existing user found, just return it
      return user;
    }

    // Generate a unique username from email or profile
    let baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    // Ensure uniqueness of the username
    while (await User.exists({ username })) {
      username = `${baseUsername}${counter++}`;
    }

    // Create a new user with OAuth provider, no password required
    user = new User({
      email,
      username,
      oauthProvider: provider,
      emailVerified: true,
      ...profileData, // any optional extra data
    });

    return await user.save();
  }

  static async findUserById(id) {
    return await User.findById(id);
  }

  static async updateUser(userId, updatedUserData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
        new: true,
        runValidators: true,
      }).then(async user => { return user });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = UserServices;
