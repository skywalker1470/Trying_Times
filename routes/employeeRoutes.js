const express = require('express');
const router = express.Router();
const { createEmployee, getAllEmployees } = require('../controllers/employeeController');

// @route   GET /api/employees
// @desc    Get all employees
router.get('/', getAllEmployees);

// @route   POST /api/employees
// @desc    Create a new employee
router.post('/', createEmployee);

module.exports = router;
