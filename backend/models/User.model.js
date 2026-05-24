const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    qualification: {
      type: String,
      enum: {
        values: ['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'],
        message: '{VALUE} is not a valid qualification',
      },
    },
    age: {
      type: Number,
      min: [15, 'Age must be at least 15'],
      max: [65, 'Age must be at most 65'],
    },
    dateOfBirth: {
      type: Date,
    },
    category: {
      type: String,
      enum: {
        values: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'],
        message: '{VALUE} is not a valid category',
      },
    },
    skills: {
      type: [String],
      default: [],
    },
    interestedFields: {
      type: [String],
      enum: {
        values: [
          'SSC',
          'UPSC',
          'Railway',
          'Banking',
          'Defence',
          'State PSC',
          'Teaching',
          'Police',
          'Other',
        ],
        message: '{VALUE} is not a valid field',
      },
      default: [],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', userSchema);
