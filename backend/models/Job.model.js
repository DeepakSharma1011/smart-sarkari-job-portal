const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },


    department: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    qualification: {
      type: String,
      required: true,
      enum: [
        "10th",
        "12th",
        "ITI",
        "Diploma",
        "Graduation",
        "Post Graduation",
      ],
    },

    min_age: {
      type: Number,
      required: true,
    },

    max_age: {
      type: Number,
      required: true,
    },

    last_date: {
      type: Date,
      required: true,
    },

    field: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      default: "",
    },

    all_india: {
      type: Boolean,
      default: false,
    },

    notification_year: {
      type: Number,
      default: new Date().getFullYear(),
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    applyLink: String,
    notificationPdf: String,

    skillsRequired: {
      type: [String],
      default: [],
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },


  },
  {
    timestamps: true,
  }
);

/* ========= VALIDATION ========= */
jobSchema.pre("save", function (next) {

  // age check
  if (this.min_age > this.max_age) {
    return next(
      new Error("Minimum age cannot be greater")
    );
  }

  next();
});

/* ========= CHECK EXPIRED ========= */
jobSchema.virtual("isExpired").get(function () {
  return new Date() > this.last_date;
});

/* ========= INDEXES ========= */
jobSchema.index({ title: "text" });
jobSchema.index({ field: 1 });
jobSchema.index({ state: 1 });

module.exports = mongoose.model("Job", jobSchema);
