import React from 'react';

const SuccessModal = ({ currentPlayer, handleCloseModal }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Congratulations!</h2>
        <p>You correctly guessed the player:</p>
        <p style={{ fontSize: '4rem', color: '#007A33' }}>{currentPlayer.name}</p>
        <p style={{ fontSize: '7rem', color: '#007A33' }}>{currentPlayer.number}</p>
        <button onClick={handleCloseModal} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
      </div>
    </div>
  );
};

export default SuccessModal;
