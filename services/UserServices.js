const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Profile = require("../models/Profile");

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
    const newUser = await User.create({
      email,
      username,
      oauthProvider: provider,
      emailVerified: true,
      ...profileData, // any optional extra data
    });

    try {
      const profile = await Profile.create({
        user: newUser._id,
        avatar: profileData.picture || "",
      });
      await User.updateOne(newUser._id, { profile: profile._id });
    } catch (error) {
      console.error("Profile creation failed:", error);
      //  await User.findByIdAndDelete(user._id)
    }

    return newUser;
  }

  static async findUserById(id) {
    return await User.findById(id);
  }

  static async CreateUser(data) {
    const user = await User.create(data);

    // Immediately create an associated profile
    try {
      const profile = await new Profile({ user: user._id }).save();
      await User.updateOne(user._id, { profile: profile._id });
    } catch (error) {
      console.error("Profile creation failed:", error);
      //  await User.findByIdAndDelete(user._id)
    }

    return user;
  }

  static async updateUser(userId, updatedUserData) {
    try {
      if (!userId || !updatedUserData) {
        throw new Error("Invalid input: userId and updatedUserData are required");
      }
      return await User.findByIdAndUpdate(userId, updatedUserData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }

}

module.exports = UserServices;
