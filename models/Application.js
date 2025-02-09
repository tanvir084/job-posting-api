const mongoose = require('mongoose');

/**
 * Application Schema
 * Represents a job application submitted by a candidate.
 */
const ApplicationSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', ApplicationSchema);
