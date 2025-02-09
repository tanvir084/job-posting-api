require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');

// Import routes and Swagger configuration
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const authRoutes = require('./routes/auth');
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  methods: '*',
};

app.use(cors(corsOptions));

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allows all origins; adjust as needed
    methods: ['GET', 'POST'],
  },
});

// ✅ In-memory storage for connected employer sockets
const employerSockets = {};

// ✅ Handle new socket connections
io.on('connection', (socket) => {
  console.log('New client connected, socket id:', socket.id);

  // ✅ Register employer with socket
  socket.on('register', (data) => {
    if (data?.employerId) {
      employerSockets[data.employerId] = socket.id;
      console.log(`Socket registered for employer ${data.employerId}`);
    } else {
      console.warn('Received register event without employerId.');
    }
  });

  // ✅ Handle disconnection
  socket.on('disconnect', () => {
    for (const [employerId, socketId] of Object.entries(employerSockets)) {
      if (socketId === socket.id) {
        console.log(`Employer ${employerId} disconnected`);
        delete employerSockets[employerId];
        break;
      }
    }
  });
});

// ✅ Middleware: Attach `io` and `employerSockets` to `req`
app.use((req, res, next) => {
  req.io = io;
  req.employerSockets = employerSockets;
  next();
});

// ✅ Default Route (Welcome Message)
app.get('/', (req, res) => {
  res.status(200).send(`
    <h1>Welcome to the Job Posting API! 🚀</h1>
    <p>View the API documentation: <a href="http://localhost:3000/api-docs" target="_blank">Swagger Docs</a></p>
  `);
});


// ✅ Mount Swagger UI on `/api-docs`
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ✅ Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// ✅ MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/job_platform';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Export `app` and `server` (for testing)
module.exports = { app, server };
