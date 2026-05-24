const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// --------------- Middleware ---------------

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "*",
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve static frontend files
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

// --------------- API Routes ---------------

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);

// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Sarkari Job Portal API is running",
    timestamp: new Date().toISOString(),
  });
});

// Development-only: Seed database endpoint
if (process.env.NODE_ENV === "development") {
  app.post("/api/seed", async (req, res) => {
    try {
      const User = require("./models/User.model");
      const Job = require("./models/Job.model");

      // Seed admin if not exists
      let admin = await User.findOne({ role: "admin" });
      if (!admin) {
        admin = await User.create({
          name: "Admin",
          email: "admin@smartsarkari.com",
          password: "Admin@123",
          phone: "9876543210",
          role: "admin",
          qualification: "Post Graduation",
          age: 30,
          category: "General",
        });
        console.log("✅ Admin user created");
      }

      // Clear jobs instead of seeding static data
      await Job.deleteMany({});

      const counts = {
        jobs: await Job.countDocuments(),
      };

      res.status(200).json({
        success: true,
        message: "Database seeded successfully!",
        counts,
      });
    } catch (err) {
      console.error("❌ Seed error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
}

// Serve frontend for all non-API routes (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

// --------------- Error Handling ---------------

app.use(errorHandler);

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Smart Sarkari Job Portal Server`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
