const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const hpp = require("hpp");
const compression = require("compression");
require("dotenv").config();

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./utils/rateLimiter");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const applicationsRoutes = require("./routes/applicationsRoutes");

const app = express();

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security middleware
app.use(helmet());

app.use(hpp());
app.use(compression());

// Rate limiting
app.use("/api/", apiLimiter);

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);

// Welcome message for root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to JobMatchHub API",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
