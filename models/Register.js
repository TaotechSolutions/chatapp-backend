const mongoose = require("mongoose");

const Registerschema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true}
},
{timestamp: true}
)

const User = mongoose.model("Register", Registerschema);

module.exports = User;