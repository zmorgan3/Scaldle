import React, { useState } from 'react';
import LandingPage from './LandingPage'; // Import the LandingPage component
import Game from './Game'; // Import the Game component

function App() {
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started

  const startGame = () => {
    setGameStarted(true); // Start the game
  };

  const goBackToLandingPage = () => {
    setGameStarted(false); // Reset to show the landing page again
  };

  return (
    <div className="app">
      {!gameStarted ? (
        <LandingPage startGame={startGame} /> // Show Landing Page if the game hasn't started
      ) : (
        <Game goBack={goBackToLandingPage} /> // Pass goBack function to the Game component
      )}
    </div>
  );
}

export default App;
