require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Added for payroll-management
const path = require('path'); // Added for EJS setup

const connectDB = require('./config/db'); // Trying_Times's DB connection

const app = express();
const PORT = 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // Added for payroll-management
app.use(express.static('public'));

// EJS Setup (from payroll-management)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Trying_Times Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const employeeRoutes = require('./routes/workers'); // Trying_Times's employee routes
const zoneRoutes = require('./routes/zone');
const departmentRoutes = require('./routes/department');
const teamRoutes = require('./routes/team');
const checkinRoutes = require('./routes/checkin');
const approvalRoutes = require('./routes/approval');
const checkoutRoutes = require('./routes/checkout'); // New line

// New public employee routes for payroll-management
const publicEmployeeRoutes = require('./routes/publicEmployeeRoutes');
app.use('/api/public-employees', publicEmployeeRoutes); // Mounted under new path

app.use('/api/checkin', checkinRoutes);
app.use('/api/checkin/approval', approvalRoutes);
app.use('/api/checkout', checkoutRoutes); // New line
app.use('/api/workers', employeeRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);

// Payroll-Management Routes (integrated)
const payrollRoutes = require('./routes/payrollRoutes');
const assetRoutes = require('./routes/assetRoutes');

app.get('/payroll', (req, res) => {
  res.render('payroll', { title: 'Payroll Management' });
});

app.use('/api/payroll', payrollRoutes);
app.use('/assets', assetRoutes); // This will render EJS views

// Root route for Main Menu (from payroll-management's index.ejs)
app.get('/', (req, res) => {
  res.render('index'); // Render the main menu
});

// Error handling middleware (from Trying_Times, more robust)
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