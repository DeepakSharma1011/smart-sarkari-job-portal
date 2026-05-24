const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: [true, 'Job name is required'],
      trim: true,
      maxlength: [200, 'Job name cannot exceed 200 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    qualificationRequired: {
      type: String,
      required: [true, 'Qualification is required'],
      enum: {
        values: ['10th', '12th', 'ITI', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'],
        message: '{VALUE} is not a valid qualification',
      },
    },
    minAge: {
      type: Number,
      required: [true, 'Minimum age is required'],
      min: [15, 'Minimum age must be at least 15'],
    },
    maxAge: {
      type: Number,
      required: [true, 'Maximum age is required'],
      max: [65, 'Maximum age must be at most 65'],
    },
    categoryRelaxation: {
      General: { type: Number, default: 0 },
      OBC: { type: Number, default: 3 },
      SC: { type: Number, default: 5 },
      ST: { type: Number, default: 5 },
      EWS: { type: Number, default: 0 },
      PwD: { type: Number, default: 10 },
    },
    applicationFee: {
      general: { type: Number, default: 0 },
      obc: { type: Number, default: 0 },
      sc_st: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
    },
    lastDate: {
      type: Date,
      required: [true, 'Last date of application is required'],
    },
    examDate: {
      type: Date,
    },
    vacancyDetails: {
      total: { type: Number, default: 0 },
      general: { type: Number, default: 0 },
      obc: { type: Number, default: 0 },
      sc: { type: Number, default: 0 },
      st: { type: Number, default: 0 },
      ews: { type: Number, default: 0 },
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    field: {
      type: String,
      required: [true, 'Job field is required'],
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
          'IT & CS',
          'Other',
        ],
        message: '{VALUE} is not a valid field',
      },
    },
    applyLink: {
      type: String,
    },
    notificationPdf: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'upcoming'],
      default: 'active',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: check if job is expired
jobSchema.virtual('isExpired').get(function () {
  return new Date() > this.lastDate;
});

// Virtual: days remaining until deadline
jobSchema.virtual('daysRemaining').get(function () {
  const diff = this.lastDate - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Indexes for faster queries
jobSchema.index({ qualificationRequired: 1 });
jobSchema.index({ field: 1 });
jobSchema.index({ lastDate: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ jobName: 'text', department: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
