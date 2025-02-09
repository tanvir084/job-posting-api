const mongoose = require('mongoose');

/**
 * Employer Schema
 * Represents an employer who can post job listings on the platform.
 */
const EmployerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures each employer email is unique
    },
    password: {
      type: String,
      required: true, // This should store a hashed password
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Employer', EmployerSchema);
