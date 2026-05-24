const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('../models/Job.model');
const connectDB = require('../config/db');

const clearJobs = async () => {
  try {
    await connectDB();

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('🗑️  All predefined and seeded jobs cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing jobs:', error.message);
    process.exit(1);
  }
};

clearJobs();
