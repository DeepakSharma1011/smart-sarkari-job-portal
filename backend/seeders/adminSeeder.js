const User = require("../models/User.model");
const connectDB = require("../config/db");

require("dotenv").config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // check admin
    const adminExists = await User.findOne({
      email: "admin@smartsarkari.com",
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    // create admin
    await User.create({
      name: "Admin",
      email: "admin@smartsarkari.com",
      password: "Admin@123",
      phone: "9876543210",
      role: "admin",
      qualification: "Post Graduation",
      age: 30,
      category: "General",
    });

    console.log("Admin created successfully");

    process.exit();
  } catch (error) {
    console.log(error.message);

    process.exit(1);
  }
};

seedAdmin();
