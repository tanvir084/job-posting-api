const express = require('express');
const { check, validationResult, param } = require('express-validator');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - candidateName
 *         - candidateEmail
 *         - jobId
 *       properties:
 *         candidateName:
 *           type: string
 *           description: Name of the candidate.
 *         candidateEmail:
 *           type: string
 *           description: Email of the candidate.
 *         jobId:
 *           type: string
 *           description: ID of the job being applied for.
 *         applicationDate:
 *           type: string
 *           format: date-time
 *           description: Date of application.
 *       example:
 *         candidateName: "string"
 *         candidateEmail: "string@test.com"
 *         jobId: "607d1b2f4f1c2c0015f3e2b5"
 */

/**
 * @swagger
 * /api/applications/{jobId}/apply:
 *   post:
 *     summary: Candidate applies for a job posting.
 *     tags:
 *       - Applications
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to apply for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateName
 *               - candidateEmail
 *             properties:
 *               candidateName:
 *                 type: string
 *               candidateEmail:
 *                 type: string
 *             example:
 *               candidateName: "string"
 *               candidateEmail: "string@test.com"
 *     responses:
 *       201:
 *         description: Application submitted successfully.
 *       400:
 *         description: Input validation error.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Server error.
 */
router.post(
  '/:jobId/apply',
  [
    // Validate jobId as a MongoDB ObjectId
    param('jobId').isMongoId().withMessage('Invalid job ID'),

    // Validate candidate name (must not be empty)
    check('candidateName').notEmpty().withMessage('Candidate name is required'),

    // Validate email format
    check('candidateEmail')
      .isEmail()
      .withMessage('A valid candidate email is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { candidateName, candidateEmail } = req.body;
      const jobId = req.params.jobId;

      // Check if the job exists, selecting only necessary fields for optimization
      const job = await Job.findById(jobId).select('_id employerId').lean();

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Create a new application instance
      const application = new Application({
        candidateName,
        candidateEmail,
        jobId,
      });

      // Save application to the database
      await application.save();

      // Emit real-time notification if the employer is connected via WebSockets
      req.io
        ?.to(req.employerSockets?.[job.employerId])
        ?.emit('newApplication', {
          jobId: job._id,
          candidate: { candidateName, candidateEmail },
        });

      console.log(`Notification emitted for jobId: ${job._id}`);

      // Return application response
      res.status(201).json(application);
    } catch (err) {
      console.error('Error processing job application:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

module.exports = router;
