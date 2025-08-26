const Worker = require('../models/Employee');

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Public (for now)
exports.createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, employeeId } = req.body;

        const newEmployee = new Worker({ firstName, lastName, employeeId });

        await newEmployee.save();
        res.status(201).json({ success: true, data: newEmployee });
    } catch (error) {
        // Handle potential duplicate employeeId error
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Employee ID already exists.' });
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all employees
// @route   GET /api/employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Worker.find();
        const formattedEmployees = employees.map(emp => ({
            ...emp.toObject(),
            name: emp.fullName // Use the virtual 'fullName' property
        }));
        res.status(200).json({ success: true, data: formattedEmployees });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
