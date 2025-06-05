const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function () {
      return this.oauthProvider === "local";
    },
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return this.oauthProvider === "local";
    },
    select: false, //ensures that we exclude the password hash from all query results by default for security
  },
  status: {
    type: String,
    enum: ["activated", "deactivated"],
    default: "activated",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin", "superAdmin"],
    default: "user",
  },
  oauthProvider: {
    type: String,
    enum: ["local", "google", "github"],
    default: "local",
  },
});

UserSchema.set("timestamps", true);

// Custom validation to ensure either password or oauthProvider is present @ todo: test both user creation auth.
UserSchema.pre("validate", function (next) {
  if (!this.password && this.oauthProvider === "local") {
    this.invalidate("password", "Password is required for local authentication.");
  }
  if (this.password && this.oauthProvider !== "local") {
    this.invalidate("oauthProvider", "OAuth provider should be 'local' when password is present.");
  }
  next();
});

// Hash the password before saving it to the database
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await bcryptjs.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.index({
  username: "text",
  email: "text",
  createdAt: "text",
});

module.exports = mongoose.model("User", UserSchema);
