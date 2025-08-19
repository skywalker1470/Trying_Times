const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const Zone = require('../models/Zone');
const Team = require('../models/Team');

// Your deployed Google Apps Script web app URL serving credentials + offices JSON
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzrCFgi9KVbEHnlgPd_Airo76iBUIBvrQeL2F4ybLis9CM75a8t11K6cjneblFEJuvw/exec';

async function syncZonesAndAssignTasks() {
  try {
    const res = await fetch(GOOGLE_SHEETS_API_URL);
    const data = await res.json();

    const offices = data.offices;

    if (!Array.isArray(offices)) {
      throw new Error('Offices data missing or invalid');
    }

    // For now, teams and tasks are not included in offices sheet,
    // so zones will be assigned without teams/tasks
    for (const office of offices) {
      const zoneName = office.officeName;
      const lat = parseFloat(office.lat);
      const lng = parseFloat(office.lng);

      if (!zoneName) {
        console.warn('Skipping office with missing name:', office);
        continue;
      }

      await Zone.findOneAndUpdate(
        { name: zoneName },
        {
          name: zoneName,
          team: null,
          task: '',
          assignedAt: new Date(),
          lat: Number.isNaN(lat) ? null : lat,
          lng: Number.isNaN(lng) ? null : lng
        },
        { upsert: true, new: true }
      );
    }

    console.log('Zone sync from Offices sheet complete');
  } catch (err) {
    console.error('Error syncing zones:', err);
    throw err;
  }
}

// POST /api/zones/sync-zones - Trigger sync
router.post('/sync-zones', async (req, res) => {
  try {
    await syncZonesAndAssignTasks();
    res.json({ message: 'Zone sync completed successfully.' });
  } catch (error) {
    console.error('Zone sync failed:', error);
    res.status(500).json({ error: 'Failed to sync zones.' });
  }
});

// GET /api/zones - List all zones with populated team name (if any)
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.find().populate('team', 'name');
    res.json(zones);
  } catch (err) {
    console.error('Failed to fetch zones:', err);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

module.exports = router;
