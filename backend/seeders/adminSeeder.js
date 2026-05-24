const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User.model');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@smartsarkari.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@smartsarkari.com',
      password: 'Admin@123',
      phone: '9876543210',
      role: 'admin',
      qualification: 'Post Graduation',
      age: 30,
      category: 'General',
    });

    console.log('✅ Admin user created successfully');
    console.log(`   Email: admin@smartsarkari.com`);
    console.log(`   Password: Admin@123`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
