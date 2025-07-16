const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot exceed 1000 characters']
  },
  resume: {
    type: String, // URL to resume file
    required: [true, 'Resume is required']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Index for efficient queries
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
