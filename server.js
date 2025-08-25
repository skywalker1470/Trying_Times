require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Import routes
const employeeRoutes = require('./routes/workers');
const zoneRoutes = require('./routes/zone');       // merged zone route with sync
const departmentRoutes = require('./routes/department');
const teamRoutes = require('./routes/team');
//const seeTasksRoute = require('./routes/seeTasksRoute');
const checkinRoutes = require('./routes/checkin');
const approvalRoutes = require('./routes/approval');

app.use('/api/checkin', checkinRoutes);
app.use('/api/checkin/approval', approvalRoutes);
app.use('/api/workers', employeeRoutes);
app.use('/api/zones', zoneRoutes);    // Zones and sync routes here
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
//app.use('/api/tasks', seeTasksRoute);

// Basic root route
app.get('/', (req, res) => {
  res.send('✅ Worker & Zone Management API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
