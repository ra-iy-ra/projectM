// // import React, { useState } from 'react';
// // import axios from 'axios';

// // const Weekly = () => {
// //   const [billGenerated, setBillGenerated] = useState(false);
// //   const [paymentStatus, setPaymentStatus] = useState('Pending');

// //   const handleSelectWeeklyPlan = async () => {
// //     try {
// //       const token = localStorage.getItem('token'); 
// //       const userId = localStorage.getItem('userId');

// //       if (!token || !userId) {
// //         alert("User is not authenticated. Please log in.");
// //         return;
// //       }

// //        await axios.post('http://localhost:3001/api/generate-bill', 
// //         { userId, planType: 'Weekly' }, 
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`, 
// //             'Content-Type': 'application/json', 
// //           }
// //         }
// //       );

      
// //     await axios.post('http://localhost:3001/api/plan/select-plan', 
// //       { userId, planType: 'Weekly' }, 
// //       {
// //         headers: { Authorization: `Bearer ${token}` }
// //       }
// //     );

// //       setBillGenerated(true);
// //       alert('Successfully selected the meal plan');
// //     } catch (err) {
// //       console.error('Error generating bill:', err);
// //       alert('Error generating bill. Please try again.');
// //     }
// //   };

// //   return (
// //     <div className='container'>
// //       <h2>WEEKLY COMBO</h2>
// //       <p>The amount to be paid is ₹910. You can cancel specific meals (Breakfast, Lunch, and Dinner) from your profile once this plan is selected.</p>
// //       <button 
// //         className={`btn ${billGenerated ? 'btn-success' : 'btn-warning'}`} 
// //         onClick={handleSelectWeeklyPlan}
// //       >
// //         Select Weekly Plan
// //       </button>
// //       {billGenerated && (
// //         <div>
// //           <h4>Bill</h4>
// //           <p>Meal Plan: Weekly Plan</p>
// //           <p>Amount to Pay: ₹910</p>
// //           {/* <button className='btn btn-success' onClick={handleMakePayment}>Pay</button> */}
// //         </div>
// //       )}
// //       <p>Payment Status: {paymentStatus}</p>
// //     </div>
// //   );
// // };

// // export default Weekly;

import React, { useState } from 'react'; 
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css';

const Weekly = () => {
  const [billGenerated, setBillGenerated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [startDate, setStartDate] = useState(new Date()); 
  const [showConfirmation, setShowConfirmation] = useState(false); 

  const handleSelectWeeklyPlan = () => {
    if (!startDate) {
      alert('Please select a start date for the weekly plan.');
      return;
    }
    setShowConfirmation(true); 
  };

  const confirmSelection = async (confirm) => {
    setShowConfirmation(false);
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token'); 
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        alert("User is not authenticated. Please log in.");
        return;
      }

      
      await axios.post('http://localhost:3001/api/generate-bill', 
        { userId, planType: 'Weekly', startDate }, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json', 
          }
        }
      );

      await axios.post('http://localhost:3001/api/plan/select-plan', 
        { userId, planType: 'Weekly', startDate }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBillGenerated(true);
      alert('Successfully selected the meal plan');
    } catch (err) {
      console.error('Error generating bill:', err);
      alert('Error generating bill. Please try again.');
    }
  };

  return (
    <div className='container'>
      <h2>WEEKLY COMBO</h2>
      <p>The amount to be paid is ₹910. You can cancel specific meals (Breakfast, Lunch, and Dinner) from your profile once this plan is selected.</p>
      
      
      <label>Select Start Date:</label>
      <DatePicker 
        selected={startDate} 
        onChange={(date) => setStartDate(date)} 
        dateFormat="dd-MM-yyyy"
        minDate={new Date()} 
      />

      <button 
        className={`btn ${billGenerated ? 'btn-success' : 'btn-warning'}`} 
        onClick={handleSelectWeeklyPlan}
      >
        Select Weekly Plan
      </button>


      {showConfirmation && (
        <div className='confirmation-dialog'>
          <p>Are you sure you want to start the weekly plan from {startDate.toLocaleDateString()}?</p>
          <button className='btn btn-primary' onClick={() => confirmSelection(true)}>Yes</button>
          <button className='btn btn-secondary' onClick={() => confirmSelection(false)}>No</button>
        </div>
      )}

      {billGenerated && (
        <div>
          <h4>Bill</h4>
          <p>Meal Plan: Weekly Plan</p>
          <p>Amount to Pay: ₹910</p>
        </div>
      )}
      <p>Payment Status: {paymentStatus}</p>
    </div>
  );
};

export default Weekly;



