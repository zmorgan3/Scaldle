import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage'; // Import the LandingPage component
import Game from './Game'; // Import the Game component
import './App.css'; // Import your CSS for styling

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} /> {/* Route for the landing page */}
        <Route path="/game" element={<GameWrapper />} /> {/* Route for the game */}
      </Routes>
    </Router>
  );
}

function LandingPageWrapper() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/game'); // Navigate to the /game route
  };

  return <LandingPage startGame={startGame} />;
}

function GameWrapper() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100); // Small delay to ensure animation triggers after render
  }, []);

  return (
    <div className={`app ${fadeIn ? 'fade-in' : ''}`}> {/* Apply fade-in class conditionally */}
      <Game />
    </div>
  );
}

export default App;
