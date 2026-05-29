const User = require("../models/User.model");

/* ========= REGISTER ========= */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, state } = req.body;


    // check user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      state,
    });

    res.status(201).json({
      success: true,
      token: user.getSignedJwtToken(),
      user,
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ========= LOGIN ========= */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    // find user
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      token: user.getSignedJwtToken(),
      user,
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ========= GET USER ========= */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
