const express = require('express');
const router = express.Router();
const Worker = require('../models/Employee'); // Using the consolidated Worker model

// @route   GET /
// @desc    Get all employees (publicly accessible for basic list)
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find({})
      .select('employeeId firstName lastName') // Select only necessary fields
      .sort({ lastName: 1, firstName: 1 });

    const formattedWorkers = workers.map(emp => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      fullName: `${emp.firstName} ${emp.lastName}` // Create fullName for consistency
    }));

    res.json({ data: formattedWorkers }); // Wrap in 'data' to match main.js expectation
  } catch (error) {
    console.error('Error fetching public workers:', error);
    res.status(500).json({ error: 'Failed to fetch public workers' });
  }
});

module.exports = router;