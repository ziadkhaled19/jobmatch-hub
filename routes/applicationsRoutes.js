const express = require("express");
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  getAllApplications
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { isJobSeeker, isRecruiter } = require("../middleware/roleMiddleware");
const { applicationLimiter } = require("../utils/rateLimiter");

const router = express.Router();

// all routes are protected
router.use(protect);

// Admin routes
router.get("/getAllApplications",protect, getAllApplications);

// Job Seeker routes
router.post("/", isJobSeeker, applicationLimiter, applyForJob);
router.get("/my-applications", isJobSeeker, getMyApplications);
router.delete("/:id", isJobSeeker, withdrawApplication);

// Recruiter routes
router.get("/job/:jobId", isRecruiter, getJobApplications);
router.patch("/:id/status", isRecruiter, updateApplicationStatus);
router.get("/stats", isRecruiter, getApplicationStats);

// Shared routes
router.get("/:id", getApplication);

module.exports = router;
