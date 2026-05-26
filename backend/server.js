const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");

const app = express();
connectDB(); // Connect to MongoDB

// Global Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve static frontend files from build directory
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

// API Route Bindings
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/jobs", require("./routes/job.routes"));

// API Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Smart Sarkari Job Portal API is running", 
    timestamp: new Date().toISOString() 
  });
});

// Centralized Error Handling Middleware (must be before SPA catch-all)
app.use(errorHandler);

// SPA fallback: Serve frontend index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

// Start listening on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

module.exports = app;
