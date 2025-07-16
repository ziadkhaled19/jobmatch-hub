const express = require('express');
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { isJobSeeker, isRecruiter } = require('../middleware/roleMiddleware');
const { applicationLimiter } = require('../utils/rateLimiter');

const router = express.Router();

// Job Seeker routes
router.post('/', protect, isJobSeeker, applicationLimiter, applyForJob);
router.get('/my-applications', protect, isJobSeeker, getMyApplications);
router.delete('/:id', protect, isJobSeeker, withdrawApplication);

// Recruiter routes
router.get('/job/:jobId', protect, isRecruiter, getJobApplications);
router.patch('/:id/status', protect, isRecruiter, updateApplicationStatus);
router.get('/stats', protect, isRecruiter, getApplicationStats);

// Shared routes
router.get('/:id', protect, getApplication);

module.exports = router;
