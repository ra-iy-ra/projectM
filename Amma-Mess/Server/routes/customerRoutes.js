const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const authenticate = require('../Middleware/authentication'); // assuming you have this middleware for authentication

// Get total count of customers for tomorrow
router.get('/get-tomorrow-customers', authenticate, async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date

    // Set time to 00:00:00 for tomorrow's date
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1); // The day after tomorrow

    // Find bills where the date is tomorrow
    const tomorrowBills = await Bill.find({ date: { $gte: tomorrow, $lt: nextDay } });

    // Respond with the total count of customers
    res.json({ count: tomorrowBills.length });
  } catch (error) {
    console.error('Error fetching customers for tomorrow:', error);
    res.status(500).json({ message: 'Error fetching customers for tomorrow' });
  }
});

module.exports = router;
