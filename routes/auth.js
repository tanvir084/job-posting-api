const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { secretKey } = require('../middleware/auth');
const Employer = require('../models/Employer');

/**
 * @swagger
 * components:
 *   schemas:
 *     EmployerLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: Employer's email.
 *         password:
 *           type: string
 *           description: Employer's password.
 *       example:
 *         email: employer@example.com
 *         password: password123
 *     EmployerRegister:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Employer's full name.
 *         email:
 *           type: string
 *           description: Employer's email.
 *         password:
 *           type: string
 *           description: Employer's password (minimum 6 characters).
 *       example:
 *         name: Acme Corp
 *         email: employer@example.com
 *         password: password123
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Employer login to obtain a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployerLogin'
 *     responses:
 *       200:
 *         description: Login successful. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Input validation error.
 *       401:
 *         description: Invalid email or password.
 *       500:
 *         description: Server error.
 */
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('A valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find employer by email (using lean() for better performance)
      const employer = await Employer.findOne({ email }).lean();

      if (!employer) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compare provided password with hashed password
      const validPassword = await bcrypt.compare(password, employer.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token (valid for 1 hour)
      const token = jwt.sign(
        { id: employer._id, email: employer.email },
        secretKey,
        { expiresIn: '1h' },
      );

      res.json({ token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new employer.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployerRegister'
 *     responses:
 *       201:
 *         description: Employer registered successfully.
 *       400:
 *         description: Input validation error or employer already exists.
 *       500:
 *         description: Server error.
 */
router.post(
  '/register',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('A valid email is required'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      // Check if employer already exists (using lean() for better performance)
      const existingEmployer = await Employer.findOne({ email }).lean();
      if (existingEmployer) {
        return res
          .status(400)
          .json({ error: 'Employer with that email already exists' });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new employer instance
      const employer = new Employer({ name, email, password: hashedPassword });

      // Save employer to database
      await employer.save();

      res.status(201).json({ message: 'Employer registered successfully' });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

module.exports = router;
