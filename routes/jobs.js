const express = require('express');
const { check, validationResult, param, query } = require('express-validator');
const router = express.Router();
const Job = require('../models/Job');
const { authenticateJWT } = require('../middleware/auth');
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Search for jobs by title, location, and salary range.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Job title to search for.
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Job location to search for.
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *         description: Minimum salary.
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: number
 *         description: Maximum salary.
 *     responses:
 *       200:
 *         description: A list of matching job postings.
 *       400:
 *         description: Input validation error.
 *       500:
 *         description: Server error.
 */
router.get(
  '/',
  [
    query('minSalary')
      .optional()
      .isNumeric()
      .withMessage('minSalary must be a number'),
    query('maxSalary')
      .optional()
      .isNumeric()
      .withMessage('maxSalary must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, location, minSalary, maxSalary } = req.query;
      const filters = {};

      // Text Search (if title or location provided)
      if (title || location) {
        filters.$text = { $search: `${title || ''} ${location || ''}`.trim() };
      }

      // Salary Filtering
      if (minSalary) {
        filters['salaryRange.min'] = { $gte: Number(minSalary) };
      }
      if (maxSalary) {
        filters['salaryRange.max'] = { $lte: Number(maxSalary) };
      }

      const jobs = await Job.find(filters)
        .select('title description location salaryRange employerId createdAt')
        .lean(); // Converts to plain JavaScript object for faster execution

      res.json(jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job details by job ID.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique ID of the job posting.
 *     responses:
 *       200:
 *         description: Job details retrieved successfully.
 *       400:
 *         description: Invalid job ID.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Server error.
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid job ID format')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const job = await Job.findById(req.params.id)
        .select('title description location salaryRange employerId createdAt')
        .lean();

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (err) {
      console.error('Error fetching job by ID:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - salaryRange
 *         - employerId
 *       properties:
 *         title:
 *           type: string
 *           description: Job title.
 *         description:
 *           type: string
 *           description: Detailed job description.
 *         location:
 *           type: string
 *           description: Job location.
 *         salaryRange:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 *         employerId:
 *           type: string
 *           description: ID of the employer posting the job.
 *       example:
 *         title: "Software Engineer"
 *         description: "Develop and maintain web applications."
 *         location: "New York"
 *         salaryRange: { "min": 60000, "max": 90000 }
 *         employerId: "607d1b2f4f1c2c0015f3e2b5"
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Jobs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job posting created successfully.
 *       400:
 *         description: Input validation error.
 *       500:
 *         description: Server error.
 */
router.post(
  '/',
  // authenticateJWT,
  [
    check('title').notEmpty().withMessage('Title is required'),
    check('description').notEmpty().withMessage('Description is required'),
    check('location').notEmpty().withMessage('Location is required'),
    check('salaryRange.min')
      .isNumeric()
      .withMessage('Minimum salary must be a number'),
    check('salaryRange.max')
      .isNumeric()
      .withMessage('Maximum salary must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, location, salaryRange } = req.body;
      const employerId = req.user?.id; // ✅ Optional chaining to avoid crashes if `req.user` is undefined

      if (!employerId) {
        return res
          .status(403)
          .json({ error: 'Unauthorized: Employer ID missing.' });
      }

      const job = new Job({
        title,
        description,
        location,
        salaryRange,
        employerId,
      });
      await job.save();
      res.status(201).json(job);
    } catch (err) {
      res.status(500).json({ error: 'Server error, could not create job.' });
    }
  },
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update an existing job posting.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Job posting updated successfully.
 *       400:
 *         description: Input validation error.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Server error.
 */
router.put(
  '/:id',
  authenticateJWT,
  [
    param('id').isMongoId().withMessage('Invalid job ID'),
    check('title').optional().notEmpty().withMessage('Title cannot be empty'),
    check('description')
      .optional()
      .notEmpty()
      .withMessage('Description cannot be empty'),
    check('location')
      .optional()
      .notEmpty()
      .withMessage('Location cannot be empty'),
    check('salaryRange.min')
      .optional()
      .isNumeric()
      .withMessage('Minimum salary must be a number'),
    check('salaryRange.max')
      .optional()
      .isNumeric()
      .withMessage('Maximum salary must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      if (job.employerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          error:
            'Forbidden: You are not authorized to modify this job posting.',
        });
      }
      const { title, description, location, salaryRange } = req.body;
      job.title = title || job.title;
      job.description = description || job.description;
      job.location = location || job.location;
      job.salaryRange = salaryRange || job.salaryRange;
      await job.save();
      res.json(job);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job posting.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to delete.
 *     responses:
 *       200:
 *         description: Job deleted successfully.
 *       400:
 *         description: Input validation error.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Server error.
 */
router.delete(
  '/:id',
  authenticateJWT,
  [param('id').isMongoId().withMessage('Invalid job ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
      }

      if (job?.employerId?.toString() !== req.user?.id?.toString()) {
        return res
          .status(403)
          .json({ error: 'Forbidden: You cannot delete this job.' });
      }

      await Job.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Job deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error, could not delete job.' });
    }
  },
);

module.exports = router;
