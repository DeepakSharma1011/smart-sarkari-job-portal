const User = require("../models/User.model");

/* ========= GET PROFILE ========= */
const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ========= UPDATE PROFILE ========= */
const updateProfile = async (req, res) => {
  try {


    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user,
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
