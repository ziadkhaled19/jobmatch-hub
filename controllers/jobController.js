const Job = require("../models/Job");
const ApiError = require("../utils/apiError");
const jwt = require("jsonwebtoken");

const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      company,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query object
    const query = { isActive: true };

    // Search in title, company, and description
    if (search) {
      query.$text = { $search: search };
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Company filter
    if (company) {
      query.company = { $regex: company, $options: "i" };
    }

    // Salary range filter
    if (minSalary) {
      query["salary.min"] = {};
      query["salary.min"].$gte = parseInt(minSalary);
    }

    if (maxSalary) {
      query["salary.max"] = {};
      query["salary.max"].$lte = parseInt(maxSalary);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Sort order
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const jobs = await Job.find(query)
      .populate("postedBy", "name profile.company")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Update view counts if user is authenticated
    if (req.user) {
      await Job.updateMany(
        { _id: { $in: jobs.map((job) => job._id) } },
        { $inc: { viewsCount: 1 } }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name profile.company profile.website"
    );

    if (!job) {
      return next(new ApiError("Job not found", 404));
    }

    if (!job.isActive) {
      return next(new ApiError("Job is no longer active", 400));
    }

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.postedBy = req.user._id;

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ApiError("Job not found", 404));
    }

    // Make sure user is job owner
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new ApiError("Not authorized to update this job", 403));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ApiError("Job not found", 404));
    }

    // Make sure user is job owner
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new ApiError("Not authorized to delete this job", 403));
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getMyJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { postedBy: req.user._id };

    if (status) {
      query.isActive = status === "active";
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ApiError("Job not found", 404));
    }

    // Make sure user is job owner
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new ApiError("Not authorized to update this job", 403));
    }

    job.isActive = !job.isActive;
    await job.save();

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleJobStatus,
};
