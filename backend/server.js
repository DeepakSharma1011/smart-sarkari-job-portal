const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");
const Job = require("./models/Job.model");

const app = express();

// DB Connect
connectDB();

// Expired jobs cleanup
const cleanExpiredJobs = async () => {
  try {
    const result = await Job.updateMany(
      {
        last_date: { $lt: new Date() },
        is_active: true,
      },
      {
        is_active: false,
        status: "expired",
      },
    );

    if (result.modifiedCount) {
      console.log(`🧹 ${result.modifiedCount} jobs expired`);
    }
  } catch (err) {
    console.log(err.message);
  }
};

cleanExpiredJobs();
setInterval(cleanExpiredJobs, 12 * 60 * 60 * 1000);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static frontend
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/jobs", require("./routes/job.routes"));

// Health route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

// Error middleware
app.use(errorHandler);

// Frontend route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
