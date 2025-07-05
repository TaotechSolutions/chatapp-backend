const Profile = require('../models/User.js'); 

const createProfile = async (req, res) => {
  try {
    const { bio, avatar, location, media, files, role } = req.body;
    if (!bio || !avatar || !location) {
      return res.status(400).json({ error: "Bio, avatar, and location are required" });
    }
    const newProfile = new Profile({
      bio,
      avatar,
      location,
      media,
      files,
      role
    });
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ error: "Error creating profile" });
  }
}


const findProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  }catch (error) {
   res.status(400).json({ error: "Profile not found" });
  }
}


const updateProfile = async (req, res) => {
    try {
      const { bio, avatar, location, media, files, role } = req.body;
      const { userId } = req.params
      const updatedProfile = await Profile.findOneAndUpdate(
        { userId },
        { bio, avatar, location, media, files, role },
        { new: true }
      );
      if (!updatedProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ error: "Error updating profile" });
    }
}

module.exports = {
  findProfile,
  updateProfile,
  createProfile
};