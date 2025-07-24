const Profile = require('../models/Profile')
const User = require('../models/User')


class ProfileServices {
    static async createProfile(data) {
        try {
            const newProfile = new Profile(data);
            return await newProfile.save();
        } catch (error) {
            throw error;
        }
    }

    static async getUserProfile(userId) {
        try {
            const profile = await Profile.findOne({ user: userId })
                .populate({ path: 'user', select: '-profile -resetCount -resetDate -resetToken' })
            return profile;
        } catch (error) {
            throw error;
        }
    }
}



module.exports = ProfileServices;