const User = require("../models/User.model");
const Job = require("../models/Job.model");
const connectDB = require("../config/db");

require("dotenv").config();

const runTests = async () => {
  try {


    await connectDB();

    console.log("Testing recommendation system...");

    // clear old test data
    await User.deleteMany({
      email: "test_user_rec@example.com",
    });

    await Job.deleteMany({
      title: /Test Job/,
    });

    // create test user
    const user = await User.create({
      name: "Test User",
      email: "test_user_rec@example.com",
      password: "password123",
      qualification: "Graduation",
      age: 25,
      category: "OBC",
      state: "Uttar Pradesh",
    });

    // active matching job
    await Job.create({
      title: "Test Job Perfect",
      department: "SSC",
      qualification: "Graduation",
      min_age: 18,
      max_age: 30,
      state: "Uttar Pradesh",
      notification_year: 2026,
      last_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      is_active: true,
      field: "SSC",
    });

    // expired job
    await Job.create({
      title: "Test Job Expired",
      department: "SSC",
      qualification: "Graduation",
      min_age: 18,
      max_age: 30,
      state: "Uttar Pradesh",
      notification_year: 2026,
      last_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      is_active: false,
      field: "SSC",
    });

    // other state job
    await Job.create({
      title: "Test Job Delhi",
      department: "SSC",
      qualification: "Graduation",
      min_age: 18,
      max_age: 30,
      state: "Delhi",
      notification_year: 2026,
      last_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      is_active: true,
      field: "SSC",
    });

    // fetch valid jobs
    const jobs = await Job.find({
      is_active: true,
      last_date: { $gte: new Date() },
      $or: [
        { state: user.state },
        { all_india: true },
      ],
    });

    // checks
    const hasExpired = jobs.some(j =>
      j.title.includes("Expired")
    );

    const hasDelhi = jobs.some(j =>
      j.title.includes("Delhi")
    );

    const hasPerfect = jobs.some(j =>
      j.title.includes("Perfect")
    );

    if (hasExpired) {
      throw new Error("Expired job included");
    }

    if (hasDelhi) {
      throw new Error("Different state job included");
    }

    if (!hasPerfect) {
      throw new Error("Matching job missing");
    }

    console.log("All tests passed");

    // cleanup
    await User.deleteMany({
      email: "test_user_rec@example.com",
    });

    await Job.deleteMany({
      title: /Test Job/,
    });

    process.exit();


  } catch (error) {


    console.log(error.message);

    process.exit(1);


  }
};

runTests();
