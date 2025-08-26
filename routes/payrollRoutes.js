const express = require('express');
const router = express.Router();
const { 
    calculatePayroll,
    getPayrollHistory,
    calculateAssetDeduction
} = require('../controllers/payrollController');

// Debug middleware to log all requests to payroll routes
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// @route   GET /
// @desc    Render the payroll page
router.get('/', (req, res) => {
  console.log('Payroll route hit');
  res.render('payroll', { title: 'Payroll Management' });
});

// @route   POST /api/payroll/calculate
// @desc    Calculate payroll for an employee
router.post('/calculate', calculatePayroll);

// @route   GET /api/payroll/history/:employeeId
// @desc    Fetch payroll history for a specific employee
router.get('/history/:employeeId', (req, res, next) => {
    console.log('Payroll history route called with employeeId:', req.params.employeeId);
    next();
}, getPayrollHistory);

// @route   POST /api/payroll/asset-deduction
// @desc    Calculate asset deduction for an employee for a specific month
router.post('/asset-deduction', calculateAssetDeduction);

module.exports = router;
