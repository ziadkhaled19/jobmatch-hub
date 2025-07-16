const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleJobStatus
} = require('../controllers/jobController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { isRecruiter } = require('../middleware/roleMiddleware');
const { apiLimiter } = require('../utils/rateLimiter');

const router = express.Router();

// Public routes
router.get('/', apiLimiter, optionalAuth, getJobs);
router.get('/:id', apiLimiter, optionalAuth, getJob);

// Protected routes - Recruiter only
router.post('/', protect, isRecruiter, createJob);
router.put('/:id', protect, isRecruiter, updateJob);
router.delete('/:id', protect, isRecruiter, deleteJob);
router.patch('/:id/toggle-status', protect, isRecruiter, toggleJobStatus);

// Recruiter's own jobs
router.get('/recruiter/my-jobs', protect, isRecruiter, getMyJobs);

module.exports = router;
