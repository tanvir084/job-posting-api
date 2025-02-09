const mongoose = require('mongoose');

/**
 * Job Schema
 * Represents job postings by employers.
 */
const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    employerId: { type: String, required: true },
  },
  { timestamps: true },
);

// Indexing for faster searches
JobSchema.index({ title: 'text', location: 'text' }); // Enables text search
JobSchema.index({ 'salaryRange.min': 1, 'salaryRange.max': -1 }); // Optimizes salary filtering

module.exports = mongoose.model('Job', JobSchema);

module.exports = mongoose.model('Job', JobSchema);
