const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Enforces 1-to-1 relationship
    },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    location: { type: String, default: "" },
    media: [{ type: String }],
    files: [{ type: String }],
    // role: { type: String, default: "user" }, // duplicate for flexibility   // not needed, can just populate
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", ProfileSchema);
