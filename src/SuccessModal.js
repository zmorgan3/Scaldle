import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ currentPlayer, handleCloseModal, handleCopyResults }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Congratulations!</h2>
        <p>You correctly guessed today's player:</p>
        <p style={{ fontSize: '3rem', color: '#007A33' }}>{currentPlayer.name}</p>
        <p style={{ fontSize: '6rem', color: '#007A33' }}>{currentPlayer.number}</p>
        <p>Come back tomorrow to try again!</p>
        <button onClick={handleCloseModal} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
        <button onClick={handleCopyResults} style={{ marginTop: '20px', cursor: 'pointer' }}>Copy Results</button>
      </div>
    </div>
  );
};

export default SuccessModal;
