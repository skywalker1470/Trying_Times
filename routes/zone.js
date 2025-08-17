const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');
const Team = require('../models/Team');
const Employee = require('../models/Employee');

// Get all zones without population
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.find({}).sort({ createdAt: -1 });
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Failed to fetch zones', details: error.message });
  }
});

// Assign or update zone
router.post('/', async (req, res) => {
  try {
    const { employeeId, teamId, zone, type } = req.body;

    if (!zone) {
      return res.status(400).json({ error: 'Zone name is required.' });
    }

    if (type === 'employee' && !employeeId) {
      return res.status(400).json({ error: 'Employee ID is required for employee assignment.' });
    }

    if (type === 'team' && !teamId) {
      return res.status(400).json({ error: 'Team ID is required for team assignment.' });
    }

    let assignedTo;
    let assignedName;

    if (type === 'employee') {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found.' });
      }
      assignedTo = employee._id;
      assignedName = `${employee.firstName} ${employee.lastName}`;
    } else if (type === 'team') {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found.' });
      }
      assignedTo = team._id;
      assignedName = team.name || `Team ${team._id}`;
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "employee" or "team".' });
    }

    const existingAssignment = await Zone.findOne({
      $or: [
        { employee: type === 'employee' ? assignedTo : null },
        { team: type === 'team' ? assignedTo : null }
      ],
      status: 'active'
    });

    let savedZone;

    if (existingAssignment) {
      existingAssignment.name = zone;
      existingAssignment.lastUpdated = Date.now();
      savedZone = await existingAssignment.save();
    } else {
      const zoneData = {
        name: zone,
        type,
        assignedName,
        status: 'active'
      };

      if (type === 'employee') {
        zoneData.employee = assignedTo;
      } else {
        zoneData.team = assignedTo;
      }

      const newZone = new Zone(zoneData);
      savedZone = await newZone.save();
    }

    res.status(201).json({
      message: `Zone ${existingAssignment ? 'updated' : 'assigned'} successfully`,
      zone: savedZone
    });

  } catch (err) {
    console.error('Error assigning zone:', err);
    res.status(500).json({
      error: 'Failed to assign zone',
      details: err.message
    });
  }
});

// Delete zone assignment
router.delete('/:id', async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ error: 'Zone assignment not found.' });
    }

    await Zone.findByIdAndDelete(req.params.id);

    res.json({ message: 'Zone assignment removed successfully' });

  } catch (err) {
    console.error('Error removing zone assignment:', err);
    res.status(500).json({
      error: 'Failed to remove zone assignment',
      details: err.message
    });
  }
});

module.exports = router;
