const express = require('express');
const router = express.Router();
const Task = require('../models/Task');  // Import your Task model

// POST /api/zones - Assign a task to a zone and team (zones come directly from frontend)
router.post('/', async (req, res) => {
  try {
    const { name: zoneName, team, task } = req.body;

    if (!zoneName || !team || !task) {
      return res.status(400).json({ error: 'Please provide zone name, team, and task.' });
    }

    const newTask = new Task({
      zoneName,
      team,
      task,
      assignedAt: new Date(),
    });

    await newTask.save();

    res.json({ message: `Task assigned successfully to zone "${zoneName}".`, task: newTask });
  } catch (error) {
    console.error('Failed to assign task:', error);
    res.status(500).json({ error: 'Failed to assign task.' });
  }
});

module.exports = router;
