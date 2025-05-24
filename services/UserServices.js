const User = require('../models/User');

class UserServices {
    static async findUserByData(data, showPassword) {
        try {
            let user = await User.findOne(data);
            if (user) {
                user = user.toObject()
                if (!showPassword) { delete user.password }
            };
            return user;
        } catch (error) {
            throw error;
        }
    }
}


module.exports = UserServices;