const Job = require("../models/Job.model");
const connectDB = require("../config/db");

require("dotenv").config();

const clearJobs = async () => {
  try {
    await connectDB();

    // delete all jobs
    await Job.deleteMany({});

    console.log("All jobs deleted successfully");

    process.exit();
  } catch (error) {
    console.log(error.message);

    process.exit(1);
  }
};

clearJobs();
