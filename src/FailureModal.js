// FailureModal.js
import React from 'react';
import './FailureModal.css'; // Import any styles you want for the modal

const FailureModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Sorry!</h2>
        <p>You did not guess the correct player. Come back tomorrow to try again!</p>
        <button onClick={onClose} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
      </div>
    </div>
  );
};

export default FailureModal;
