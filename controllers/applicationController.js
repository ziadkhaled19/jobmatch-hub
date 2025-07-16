const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendApplicationNotification, sendApplicationStatusUpdate } = require('../utils/email');
const ApiError = require('../utils/apiError');

/**
 * @desc    Apply for a job
 * @route   POST /api/applications
 * @access  Private (Job Seeker only)
 */
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resume } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId).populate('postedBy');
    if (!job) {
      return next(new ApiError('Job not found', 404));
    }

    if (!job.isActive) {
      return next(new ApiError('Job is no longer accepting applications', 400));
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return next(new ApiError('Application deadline has passed', 400));
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return next(new ApiError('You have already applied for this job', 400));
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume
    });

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    // Populate application data
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company')
      .populate('applicant', 'name email');

    // Send notification email to recruiter
    sendApplicationNotification(job.postedBy, job, req.user).catch(console.error);

    res.status(201).json({
      success: true,
      data: populatedApplication
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's applications
 * @route   GET /api/applications/my-applications
 * @access  Private (Job Seeker only)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { applicant: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const applications = await Application.find(query)
      .populate('job', 'title company location jobType salary isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applications for a job
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Recruiter only - own jobs)
 */
const getJobApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { jobId } = req.params;

    // Check if job exists and user is the owner
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new ApiError('Job not found', 404));
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError('Not authorized to view applications for this job', 403));
    }

    const query = { job: jobId };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const applications = await Application.find(query)
      .populate('applicant', 'name email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application
 * @route   GET /api/applications/:id
 * @access  Private (Owner or Job Poster)
 */
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location jobType salary postedBy')
      .populate('applicant', 'name email profile');

    if (!application) {
      return next(new ApiError('Application not found', 404));
    }

    // Check if user is the applicant or the job poster
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isJobPoster = application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobPoster && !isAdmin) {
      return next(new ApiError('Not authorized to view this application', 403));
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Recruiter only - own job applications)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job', 'title company postedBy')
      .populate('applicant', 'name email');

    if (!application) {
      return next(new ApiError('Application not found', 404));
    }

    // Check if user is the job poster
    if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError('Not authorized to update this application', 403));
    }

    // Update application
    application.status = status;
    application.feedback = feedback;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;

    await application.save();

    // Send status update email to applicant
    sendApplicationStatusUpdate(application.applicant, application.job, status).catch(console.error);

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw application
 * @route   DELETE /api/applications/:id
 * @access  Private (Job Seeker only - own applications)
 */
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new ApiError('Application not found', 404));
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== req.user._id.toString()) {
      return next(new ApiError('Not authorized to withdraw this application', 403));
    }

    // Check if application can be withdrawn
    if (application.status === 'offered' || application.status === 'rejected') {
      return next(new ApiError('Cannot withdraw application in current status', 400));
    }

    // Update status to withdrawn
    application.status = 'withdrawn';
    await application.save();

    // Decrement job applications count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get application statistics
 * @route   GET /api/applications/stats
 * @access  Private (Recruiter only)
 */
const getApplicationStats = async (req, res, next) => {
  try {
    // Get all jobs posted by the recruiter
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(job => job._id);

    // Get application statistics
    const stats = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total applications
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

    // Get recent applications
    const recentApplications = await Application.find({ job: { $in: jobIds } })
      .populate('applicant', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalApplications,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats
};
