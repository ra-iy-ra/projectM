// import React, { useState } from 'react';
// import axios from 'axios';

// const Monthly = () => {
//   const [billGenerated, setBillGenerated] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState('Pending');

//   const handleSelectMonthlyPlan = async () => {
//     try {
//       const token = localStorage.getItem('token'); 
//       if (!token) {
//         alert("User is not authenticated. Please log in.");
//         return;
//       }

//       await axios.post('http://localhost:3001/api/generate-bill', 
//         { planType: 'Monthly' }, 
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, 
//             'Content-Type': 'application/json', 
//           }
//         }
//       );

//       setBillGenerated(true);
//       alert('Successfully selected the Monthly Plan');
//     } catch (err) {
//       console.error('Error generating bill:', err);
//       alert('Error generating bill. Please try again.');
//     }
//   };

//   return (
//     <div className='container'>
//       <h2>MONTHLY COMBO</h2>
//       <p>The amount to be paid is ₹3900. The discount is ₹600, so you only have to pay ₹3900. The menu of the monthly combo will be a repetition of the weekly menu.</p>
//       <button 
//         className={`btn ${billGenerated ? 'btn-success' : 'btn-warning'}`} 
//         onClick={handleSelectMonthlyPlan}
//       >
//         Select Monthly Plan
//       </button>
//       {billGenerated && (
//         <div>
//           <h4>Bill</h4>
//           <p>Meal Plan: Monthly Plan</p>
//           <p>Amount to Pay: ₹3900</p>
//         </div>
//       )}
//       <p>Payment Status: {paymentStatus}</p>
//     </div>
//   );
// };

// export default Monthly;

import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css';

const Monthly = () => {
  const [billGenerated, setBillGenerated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [startDate, setStartDate] = useState(new Date()); // State to store selected date
  const [showConfirmation, setShowConfirmation] = useState(false); // State for showing confirmation

  const handleSelectMonthlyPlan = () => {
    if (!startDate) {
      alert('Please select a start date for the monthly plan.');
      return;
    }
    setShowConfirmation(true); // Show confirmation dialog
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

      // Generate bill with selected date
      await axios.post('http://localhost:3001/api/generate-bill', 
        { userId, planType: 'Monthly', startDate }, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json', 
          }
        }
      );

      await axios.post('http://localhost:3001/api/plan/select-plan', 
        { userId, planType: 'Monthly', startDate }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBillGenerated(true);
      alert('Successfully selected the monthly plan');
    } catch (err) {
      console.error('Error generating bill:', err);
      alert('Error generating bill. Please try again.');
    }
  };

  return (
    <div className='container'>
      <h2>MONTHLY COMBO</h2>
      <p>The amount to be paid is ₹3900. The discount is ₹600, so you only have to pay ₹3900. The menu of the monthly combo will be a repetition of the weekly menu.</p>

      {/* Date Picker for Start Date */}
      <label>Select Start Date:</label>
      <DatePicker 
        selected={startDate} 
        onChange={(date) => setStartDate(date)} 
        dateFormat="dd-MM-yyyy"
        minDate={new Date()} // Prevent past dates
      />

      <button 
        className={`btn ${billGenerated ? 'btn-success' : 'btn-warning'}`} 
        onClick={handleSelectMonthlyPlan}
      >
        Select Monthly Plan
      </button>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className='confirmation-dialog'>
          <p>Are you sure you want to start the monthly plan from {startDate.toLocaleDateString()}?</p>
          <button className='btn btn-primary' onClick={() => confirmSelection(true)}>Yes</button>
          <button className='btn btn-secondary' onClick={() => confirmSelection(false)}>No</button>
        </div>
      )}

      {billGenerated && (
        <div>
          <h4>Bill</h4>
          <p>Meal Plan: Monthly Plan</p>
          <p>Amount to Pay: ₹3900</p>
        </div>
      )}
      <p>Payment Status: {paymentStatus}</p>
    </div>
  );
};

export default Monthly; 

