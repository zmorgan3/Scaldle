import React from 'react';
import './LandingPage.css'; // Import CSS for the landing page
import scalabrineImage from './images/scalabrine.png'; // Import the image
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize navigate

  const startGame = () => {
    navigate('/game'); // Navigate to the game page
  };

  return (
    <div className="landing-page">
      <h1 className="game-title">SCALDLE</h1>
      <img src={scalabrineImage} alt="Brian Scalabrine" className="scalabrine-image" />
      <p className="game-description">Can you guess today's Celtics player?</p>
      <button className="start-button" onClick={startGame}>Start Game</button> {/* Navigate to /game */}
    </div>
  );
};

export default LandingPage;
