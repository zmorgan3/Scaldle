import React from 'react';
import './LandingPage.css'; // Import CSS for the landing page
import scalabrineImage from './images/scalabrine.png'; // Import the image

const LandingPage = ({ startGame }) => {
  return (
    <div className="landing-page">
      <h1 className="game-title">SCALDLE</h1>
      <img src={scalabrineImage} alt="Brian Scalabrine" className="scalabrine-image" />
      <p className="game-description">Can you guess the Celtics player?</p>
      <button className="start-button" onClick={startGame}>Start Game</button> {/* The button triggers the startGame function */}
    </div>
  );
};

export default LandingPage;
