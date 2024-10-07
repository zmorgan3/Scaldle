import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure your main CSS file is imported
import players from './players.json'; // Assuming player data is stored here
import JerseysAnimation from './JerseysAnimation'; // Import the JerseysAnimation component

const MAX_GUESSES = 8;
const FLIP_DURATION = 800;
const FLIP_DELAY = 400;

const Game = ({ goBack }) => {
  const [guess, setGuess] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(
    players[Math.floor(Math.random() * players.length)]
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setGuess(value);

    if (value) {
      const filtered = players.filter((player) =>
        player.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setGuess(name);
    setFilteredPlayers([]);
  };

  const getArrow = (guessedValue, targetValue) => {
    if (guessedValue < targetValue) {
      return '↑'; // Up arrow
    } else if (guessedValue > targetValue) {
      return '↓'; // Down arrow
    }
    return ''; // No arrow if they are equal
  };

  const handleGuess = () => {
    if (guesses.length >= MAX_GUESSES) {
      return;
    }

    const guessedPlayer = players.find(
      (player) => player.name.toLowerCase() === guess.toLowerCase()
    );

    if (guessedPlayer) {
      const feedback = {
        name: guessedPlayer.name,
        position: guessedPlayer.position,
        number: guessedPlayer.number,
        height: guessedPlayer.height,
        debut: guessedPlayer.debut, // Make sure this matches your players.json field
        allStarAppearances: guessedPlayer.allStarAppearances,
        positionCorrect: guessedPlayer.position === currentPlayer.position,
        numberCorrect: guessedPlayer.number === currentPlayer.number,
        heightCorrect: guessedPlayer.height === currentPlayer.height,
        debutCorrect: guessedPlayer.debut === currentPlayer.debut,
        allStarCorrect: guessedPlayer.allStarAppearances === currentPlayer.allStarAppearances,
        nameCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
        overallCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
        numberHint: getArrow(guessedPlayer.number, currentPlayer.number), // Hint for number
        heightHint: getArrow(guessedPlayer.height, currentPlayer.height), // Hint for height
        debutHint: getArrow(guessedPlayer.debut, currentPlayer.debut), // Hint for debut
        allStarHint: getArrow(guessedPlayer.allStarAppearances, currentPlayer.allStarAppearances) // Hint for all-star appearances
      };

      setGuesses([...guesses, feedback]);

      feedback.keys = ['name', 'position', 'number', 'height', 'debut', 'allStarAppearances'];
      feedback.keys.forEach((_, index) => {
        setTimeout(() => {
          setFlipped((prev) => [...prev, guesses.length * 6 + index]);
        }, index * FLIP_DELAY);
      });

      const totalFlipTime = feedback.keys.length * FLIP_DELAY + FLIP_DURATION;

      if (feedback.overallCorrect) {
        setTimeout(() => {
          setShowSuccessModal(true);
        }, totalFlipTime);
      }
    } else {
      alert('Player not found. Try again!');
    }

    setGuess('');
  };

  return (
    <div className="app">
      <h1>SCALDLE</h1>
      {/* Jerseys Animation under the scoreboard */}
      <JerseysAnimation />

      <p>Guess the player: </p>

      <input
        type="text"
        value={guess}
        onChange={handleInputChange}
        placeholder="Enter player name"
        disabled={guesses.length >= MAX_GUESSES}
      />

      {filteredPlayers.length > 0 && (
        <ul className="suggestions">
          {filteredPlayers.slice(0, 5).map((player, index) => (
            <li key={index} onClick={() => handleSuggestionClick(player.name)}>
              {player.name}
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleGuess} disabled={guesses.length >= MAX_GUESSES}>
        Submit
      </button>

      <div className="grid-container">
        <h2>Guesses:</h2>
        <div className="guess-grid">
          <div className="guess-header">
            <div>Name</div>
            <div>Position</div>
            <div>#</div>
            <div>HT</div>
            <div>Debut</div> {/* Updated header */}
            <div>All-Star Appearances</div> {/* Updated header */}
          </div>

          {[...Array(MAX_GUESSES)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`guess-row ${rowIndex < guesses.length ? '' : 'skeleton'}`}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 1fr' }}
            >
              {rowIndex < guesses.length ? (
                guesses[rowIndex].keys.map((key, index) => (
                  <div
                    key={index}
                    className={`guess-item flip ${flipped.includes(rowIndex * 6 + index) ? 'flip-active' : ''}`}
                    style={{ animationDelay: `${0.2 * index}s` }}
                  >
                    <div className="flip-front"></div>
                    <div className={`flip-back ${guesses[rowIndex][`${key}Correct`] ? 'correct' : 'incorrect'}`}>
                      {key === 'number' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].numberHint}` : null}
                      {key === 'height' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].heightHint}` : guesses[rowIndex][key]}
                      {key === 'debut' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].debutHint}` : null} {/* Display debut year */}
                      {key === 'allStarAppearances' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].allStarHint}` : null} {/* Display all-star appearances */}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="guess-item skeleton-item"></div>
                  <div className="guess-item skeleton-item"></div>
                  <div className="guess-item skeleton-item"></div>
                  <div className="guess-item skeleton-item"></div>
                  <div className="guess-item skeleton-item"></div>
                  <div className="guess-item skeleton-item"></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Congratulations!</h2>
            <p>You correctly guessed the player: {currentPlayer.name}</p>
            <p style={{ fontSize: '2rem', color: '#007A33' }}>{currentPlayer.number}</p> {/* Big green font for number */}
            <button onClick={() => window.location.reload()}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
