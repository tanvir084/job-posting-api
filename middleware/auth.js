const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

/**
 * Middleware to authenticate JSON Web Token (JWT)
 * Ensures secure access to protected routes
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is missing or incorrectly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  // Extract token from the "Bearer <token>" format
  const token = authHeader.split(' ')[1];

  // Verify the token using the secret key
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err.message); // Log for debugging
      return res
        .status(403)
        .json({ error: 'Forbidden: Invalid or expired token.' });
    }

    // Attach the decoded user information to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = { authenticateJWT, secretKey };
