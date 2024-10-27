const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const authenticate = require('../Middleware/authentication'); 
const alert = require('../models/alert');

//const User = require ('../models/User');

//Generate Bill
router.post('/generate-bill', authenticate, async (req, res) => {  
  const { planType, startDate } = req.body;
  const userId = req.user.id; 

  if (!planType || !userId || !startDate) {
    return res.status(400).json({ message: 'Invalid request. PlanType, User ID, or Start Date missing.' });
  }

  try {
    const selectedStartDate = new Date(startDate); // Use the selected start date
    const endDate = new Date(selectedStartDate);
    endDate.setDate(selectedStartDate.getDate() + (planType === 'Weekly' ? 6 : 29)); // Calculate the end date

    const bills = [];

    const days = planType === 'Weekly' ? 7 : 30; // Number of days for billing

    for (let i = 0; i < days; i++) {
      const billDate = new Date(selectedStartDate);
      billDate.setDate(selectedStartDate.getDate() + i); // Set each bill date from the selected start date

      const newBill = new Bill({
        user: userId,
        planType,
        startDate: selectedStartDate,
        endDate,
        date: billDate,
        amount: 130, // Daily cost
        totalAmount: 130,
        selectedMeals: { breakfast: true, lunch: true, dinner: true }, 
        status: 'Active'
      });

      bills.push(newBill);
    }

    await Bill.insertMany(bills);
    res.status(201).json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.post('/generate-bill', authenticate, async (req, res) => {
//   const { planType, startDate } = req.body;
//   const userId = req.user.id; 

//   if (!planType || !userId || !startDate) {
//     return res.status(400).json({ message: 'Invalid request. PlanType, User ID, or Start Date missing.' });
//   }

//   try {
//     const selectedStartDate = new Date(startDate);
//     const endDate = new Date(selectedStartDate);
//     endDate.setDate(selectedStartDate.getDate() + (planType === 'Weekly' ? 6 : 29));

//     const bills = [];
//     const days = planType === 'Weekly' ? 7 : 30;

//     for (let i = 0; i < days; i++) {
//       const billDate = new Date(selectedStartDate);
//       billDate.setDate(selectedStartDate.getDate() + i);

  
//       const selectedMeals = { breakfast: true, lunch: true, dinner: true };

//       const newBill = new Bill({
//         user: userId,
//         planType,
//         startDate: selectedStartDate,
//         endDate,
//         date: billDate,
//         amount: 130, 
//         totalAmount: 130,
//         selectedMeals,
//         status: 'Active'
//       });

//       bills.push(newBill);
//     }

//     await Bill.insertMany(bills);
//     res.status(201).json(bills);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// }); fake










//User Bill History og
router.get('/bills', authenticate, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user.id }).sort({ startDate: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});










//Payment Status  og
router.post('/pay-bill/:billId', authenticate, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    bill.paymentStatus = 'Paid';
    bill.paymentDate = new Date();

    await bill.save();
    res.json({ message: 'Payment successful', bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// // Cancel and update  bill status  
// router.post('/cancel-day/:id', authenticate, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const bill = await Bill.findById(req.params.id);
//     if (!bill) return res.status(404).send('Bill not found');
    
//     bill.status = 'Cancelled';
//     await bill.save();

    
//     const notification = new alert({
//       userId: userId,
//       message: `User ${req.user.name} has cancelled their meal for ${bill.date}`,
//       type: 'meal_cancellation',
//       date: new Date(),
//   });

//   await notification.save();
    
//   res.json({ message: 'Meal cancelled and notification sent', bill });
//   } catch (error) {
//     res.status(500).send('Server error');
//   }
// });

// Cancel all meals for the day   og
router.post('/cancel-day/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).send('Bill not found');

   
    bill.status = 'Cancelled';
    bill.selectedMeals = { breakfast: false, lunch: false, dinner: false }; 
    await bill.save();

    
    const notification = new alert({
      userId: userId,
      message: `User ${req.user.name} has cancelled their meals for ${bill.date}`,
      type: 'meal_cancellation',
      date: new Date(),
    });

    await notification.save();
    
    res.json({ message: 'All meals cancelled and notification sent', bill });
  } catch (error) {
    res.status(500).send('Server error');
  }
});




// // single-meal selection
// router.post('/select-meal/:billId', authenticate, async (req, res) => {
//   const { mealType } = req.body;
//   const { billId } = req.params;

//   try {
//     const bill = await Bill.findById(billId);
//     if (!bill) return res.status(404).json({ message: 'Bill not found' });

//     // Ensure the bill status is 'Active' or allow re-selection for cancelled meals
//     if (bill.status === 'Cancelled') {
//       bill.status = 'Active';
//     }

//     if (mealType === 'breakfast') bill.selectedMeals.breakfast = true;
//     if (mealType === 'lunch') bill.selectedMeals.lunch = true;
//     if (mealType === 'dinner') bill.selectedMeals.dinner = true;

//     const mealCosts = {
//       breakfast: 40,
//       lunch: 70,
//       dinner: 40,
//     };

//     bill.amount = (bill.selectedMeals.breakfast ? mealCosts.breakfast : 0) +
//                   (bill.selectedMeals.lunch ? mealCosts.lunch : 0) +
//                   (bill.selectedMeals.dinner ? mealCosts.dinner : 0);

    
//     if (bill.selectedMeals.breakfast && bill.selectedMeals.lunch && bill.selectedMeals.dinner) {
//       bill.amount -= 20; 
//     }

//     bill.totalAmount = bill.amount;
    
//     //bill.status = 'Active';
//     await bill.save();
//     res.json({ message: 'Meal selected', bill });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



// Single-meal selection og
router.post('/select-meal/:billId', authenticate, async (req, res) => {
  const { mealType } = req.body;
  const { billId } = req.params;

  try {
    
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    
    if (bill.status === 'Cancelled') {
      bill.status = 'Active';
    }

   
    if (mealType === 'breakfast') bill.selectedMeals.breakfast = true;
    if (mealType === 'lunch') bill.selectedMeals.lunch = true;
    if (mealType === 'dinner') bill.selectedMeals.dinner = true;

    
    const mealCosts = {
      breakfast: 40,
      lunch: 70,
      dinner: 40,
    };

    
    bill.amount = (bill.selectedMeals.breakfast ? mealCosts.breakfast : 0) +
                  (bill.selectedMeals.lunch ? mealCosts.lunch : 0) +
                  (bill.selectedMeals.dinner ? mealCosts.dinner : 0);

   
    if (bill.selectedMeals.breakfast && bill.selectedMeals.lunch && bill.selectedMeals.dinner) {
      bill.amount -= 20; 
    }

    bill.totalAmount = bill.amount;

    
    await bill.save();
    res.json({ message: 'Meal selected', bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});









// generate-bill for single-meal og
router.post('/generate-single-meal-bill', authenticate, async (req, res) => {
  const { mealType } = req.body;
  const userId = req.user.id;

  if (!mealType || !userId) {
    return res.status(400).json({ message: 'Invalid request. Meal type or User ID missing.' });
  }

  try {
    // const today = new Date();
    // today.setHours(0, 0, 0, 0); 

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); 
    tomorrow.setHours(0, 0, 0, 0);
    
    let bill = await Bill.findOne({ user: userId, date: tomorrow  });

    const mealCosts = {
      breakfast: 40,
      lunch: 70,
      dinner: 40,
    };

    if (bill) {
      
      if (mealType === 'breakfast') bill.selectedMeals.breakfast = true;
      if (mealType === 'lunch') bill.selectedMeals.lunch = true;
      if (mealType === 'dinner') bill.selectedMeals.dinner = true;

      
      bill.amount = (bill.selectedMeals.breakfast ? mealCosts.breakfast : 0) +
                    (bill.selectedMeals.lunch ? mealCosts.lunch : 0) +
                    (bill.selectedMeals.dinner ? mealCosts.dinner : 0);

      
      if (bill.selectedMeals.breakfast && bill.selectedMeals.lunch && bill.selectedMeals.dinner) {
        bill.amount -= 20; 
      }

      bill.totalAmount = bill.amount;
    } else {
      
      bill = new Bill({
        user: userId,
        planType: 'Single Meal',
        date:  tomorrow,
        amount: mealCosts[mealType],
        totalAmount: mealCosts[mealType],
        selectedMeals: {
          breakfast: mealType === 'breakfast',
          lunch: mealType === 'lunch',
          dinner: mealType === 'dinner',
        },
      });
    }

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// get selected meals for today  og
router.get('/get-selected-meals', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); 
    tomorrow.setHours(0, 0, 0, 0);

    
    const bill = await Bill.findOne({ user: userId, date: tomorrow });

    if (!bill) {
      return res.json({ selectedMeals: { breakfast: false, lunch: false, dinner: false } });
    }

    
    res.json({ selectedMeals: bill.selectedMeals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.get('/get-selected-meals', authenticate, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { startDate, endDate } = req.query;

//     const selectedMeals = await Bill.find({
//       user: userId,
//       date: { $gte: new Date(startDate), $lte: new Date(endDate) },
//       'selectedMeals.breakfast': true
//     });

    

//     const mealStatus = {
//       breakfast: selectedMeals.some((bill) => bill.selectedMeals.breakfast),
//       lunch: selectedMeals.some((bill) => bill.selectedMeals.lunch),
//       dinner: selectedMeals.some((bill) => bill.selectedMeals.dinner)
//     };

//     res.json({ selectedMeals: mealStatus });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;


//............latest.............


