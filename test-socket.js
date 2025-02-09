// 📌 Socket.IO Test Client
// This file is used to test real-time notifications from the server.
// Ensure your API server is running before testing.

// ✅ How to Test:
// 1️⃣ Start the Job Posting API: `yarn start` or `docker compose up --build -d`
// 2️⃣ Replace the employerId below with an actual employerId from your database.
// 3️⃣ Run this script: `node socket-test.js`
// 4️⃣ If a candidate applies for a job, you'll receive a real-time notification.

const io = require('socket.io-client');

// Ensure the URL and port match your running server (http://localhost:3000)
const socket = io('http://localhost:3000', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Connected to Socket.IO server, socket id:', socket.id);

  // ✅ Replace '67a7cfa24ac1ab925c2a1a7c' with an actual employerId from your database
  // To get a valid employerId:
  // - Check your MongoDB database (`db.employers.findOne()` in MongoDB shell)
  // - Use a valid employer ID returned by the `/api/auth/register` or `/api/auth/login` API
  socket.emit('register', { employerId: '67a7cfa24ac1ab925c2a1a7c' });
});

socket.on('newApplication', (data) => {
  console.log('Received new application:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
