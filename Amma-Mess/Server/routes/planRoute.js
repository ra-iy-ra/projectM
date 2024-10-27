// const express = require('express');
// const router = express.Router();
// const User = require('../models/User'); 


// router.post('/select-plan', async (req, res) => {
//   try {
//     const { userId, planType } = req.body;

//     if (!userId || !planType) {
//       return res.status(400).json({ error: 'User ID and plan type are required' });
//     }

//     const planEndDate = planType === 'Weekly'
//       ? new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) 
//       : new Date(Date.now() + 29 * 24 * 60 * 60 * 1000); 

//       console.log(`Updating user ${userId} with planType: ${planType} and planEndDate: ${planEndDate}`);

//     const user = await User.findByIdAndUpdate(userId, { planType, planEndDate },
//       { new: true } 
//     );

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.status(200).json({ message: 'Plan selected successfully',user });
//   } catch (error) {
//     console.error('Error selecting plan:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

router.post('/select-plan', async (req, res) => {
  try {
    const { userId, planType, startDate } = req.body;

    if (!userId || !planType || !startDate) {
      return res.status(400).json({ error: 'User ID, plan type, and start date are required' });
    }

    const planEndDate = planType === 'Weekly'
      ? new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000)  // 7 days total
      : new Date(new Date(startDate).getTime() + 29 * 24 * 60 * 60 * 1000); // 30 days total

    console.log(`Updating user ${userId} with planType: ${planType}, startDate: ${startDate} and planEndDate: ${planEndDate}`);

    const user = await User.findByIdAndUpdate(userId, { planType, planEndDate },
      { new: true } 
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Plan selected successfully', user });
  } catch (error) {
    console.error('Error selecting plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
