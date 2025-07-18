const ProfileServices = require("../services/ProfileServices");
const { successResponse } = require("../utils/responses");


const createProfile = async (req, res) => { };

const findProfile = async (req, res) => { };

const updateProfile = async (req, res) => { };

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const profile = await ProfileServices.getUserProfile(userId)
    return successResponse(res, 200, "Profile fetched successfully", profile);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

module.exports = {
  findProfile,
  updateProfile,
  createProfile,
  getUserProfile
};
