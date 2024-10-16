import React, { useEffect, useState } from 'react';
import './SuccessModal.css';

const SuccessModal = ({ currentPlayer, handleCloseModal, handleCopyResults }) => {
  const [playerOfTheDay, setPlayerOfTheDay] = useState(null);

  // Fetch the correct player from the backend to ensure that we're displaying the correct player in the modal
  useEffect(() => {
    const fetchPlayerOfTheDay = async () => {
      try {
        const response = await fetch('https://celtics-trivia-backend1-6c0095e46832.herokuapp.com/submit-guess');
        const data = await response.json();
        setPlayerOfTheDay(data);
      } catch (error) {
        console.error('Failed to fetch player of the day:', error);
      }
    };
    fetchPlayerOfTheDay();
  }, []);

  if (!playerOfTheDay) {
    return null; // Add a loading state or return null while the player data is being fetched
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Congratulations!</h2>
        <p>You correctly guessed today's player:</p>
        <p style={{ fontSize: '3rem', color: '#007A33' }}>{playerOfTheDay.name}</p>
        <p style={{ fontSize: '6rem', color: '#007A33' }}>{playerOfTheDay.number}</p>
        <p>Come back tomorrow to try again!</p>
        <button onClick={handleCloseModal} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
        <button onClick={handleCopyResults} style={{ marginTop: '20px', cursor: 'pointer' }}>Copy Results</button>
      </div>
    </div>
  );
};

export default SuccessModal;
