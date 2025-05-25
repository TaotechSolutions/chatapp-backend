const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false,
        select: true
    },
    status: {
        type: String,
        required: true,
        enum: ['activated', "deactivated"],
        default: "activated"
    },
    emailVerified: {
        type: Boolean,
        required: true
    },
    role: {
        type: String,
        required: false,
        enum: ["user", "admin", "superAdmin"],
        default: "user"
    }
});

UserSchema.set("timestamps", true);

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
    username: 'text',
    email: 'text',
    createdAt: 'text',
});

module.exports = mongoose.model("User", UserSchema);