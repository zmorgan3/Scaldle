import React from 'react';
import './FailureModal.css';

const FailureModal = ({ currentPlayer, handleCloseModal, handleCopyResults }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Game Over!</h2>
        <p>You did not guess the correct player. Today's player was:</p>
        <p style={{ fontSize: '3rem', color: '#007A33' }}>{currentPlayer.name}</p>
        <p style={{ fontSize: '5rem', color: '#007A33' }}>{currentPlayer.number}</p>
        <p>Come back tomorrow to try again!</p>
        <button onClick={handleCloseModal} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
        <button onClick={handleCopyResults} style={{ marginTop: '20px', cursor: 'pointer' }}>Copy Results</button>
      </div>
    </div>
  );
};

export default FailureModal;
