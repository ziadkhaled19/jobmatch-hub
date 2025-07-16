const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  requirements: {
    type: String,
    required: [true, 'Job requirements are required'],
    maxlength: [1000, 'Job requirements cannot exceed 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote']
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['entry-level', 'mid-level', 'senior-level', 'executive']
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  benefits: [String],
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search optimization
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1, jobType: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
