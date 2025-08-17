const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Worker = require('../models/Employee'); // ✅ fixed import
const Department = require('../models/Department');
const Team = require('../models/Team');

const allowedRoles = ["admin", "manager", "employee"];

// @route   POST /api/workers
// @desc    Create a new worker, department optional
router.post('/', async (req, res) => {
  try {
    const {
      employeeId, firstName, lastName, email, phone,
      department, position, status, address, emergencyContact, skills, role
    } = req.body;

    // Basic validation (department is optional)
    if (!employeeId || !firstName || !lastName || !email || !position || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    // Validate department if provided
    if (department) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({ error: 'Invalid department ID format' });
      }
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    // Check if employeeId or email already exists
    const existingWorker = await Worker.findOne({
      $or: [{ employeeId }, { email }]
    });
    if (existingWorker) {
      return res.status(400).json({ error: 'Worker with this ID or email already exists' });
    }

    const workerData = {
      employeeId,
      firstName,
      lastName,
      email,
      phone: phone || '',
      position,
      status: status || 'Active',
      address: address || {},
      emergencyContact: emergencyContact || {},
      skills: skills || [],
      role,
      hireDate: new Date()
    };

    if (department) workerData.department = department;

    const worker = new Worker(workerData);
    await worker.save();

    const savedWorker = await Worker.findById(worker._id)
      .populate('department', 'name')
      .populate('team', 'name');

    res.status(201).json(savedWorker);

  } catch (error) {
    console.error('Error creating worker:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// @route   PUT /api/workers/:id
// @desc    Update worker details, department optional
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };

    delete updates.employeeId;
    delete updates.email;
    delete updates.createdAt;

    if (updates.role && !allowedRoles.includes(updates.role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ error: 'Invalid department ID format' });
      }
      const departmentExists = await Department.findById(updates.department);
      if (!departmentExists) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('department', 'name')
     .populate('team', 'name');

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Error updating worker:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.message });
    }
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// @route   GET /api/workers
// @desc    Get all workers with populated department and team info
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find({})
      .sort({ lastName: 1, firstName: 1 });

    const formattedWorkers = workers.map(emp => ({
      id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department ? emp.department : 'Not assigned',
      team: emp.team ? emp.team : 'Not assigned',
      status: emp.status,
      role: emp.role
    }));

    res.json(formattedWorkers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// @route   GET /api/workers/:id
// @desc    Get a single worker by ID with populated department and team info
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('department', 'name')
      .populate('team', 'name');
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

module.exports = router;
