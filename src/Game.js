import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure your main CSS file is imported
import './Game.css';
import players from './players.json'; // Assuming player data is stored here
import JerseysAnimation from './JerseysAnimation'; // Import the JerseysAnimation component
import FailureModal from './FailureModal'; // Import the FailureModal component

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
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [inputDisabled, setInputDisabled] = useState(false); // New state to control input box visibility

  // Check for screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    handleGuess(name); // Automatically call handleGuess with the player's name
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

  const handleGuess = (guessedName) => {
    if (guesses.length >= MAX_GUESSES) {
      return;
    }

    const guessedPlayer = players.find(
      (player) => player.name.toLowerCase() === guessedName.toLowerCase()
    );

    if (guessedPlayer) {
      const feedback = {
        name: guessedPlayer.name,
        position: guessedPlayer.position,
        number: guessedPlayer.number,
        height: guessedPlayer.height,
        debut: guessedPlayer.debut,
        allStarAppearances: guessedPlayer.allStarAppearances,
        positionCorrect: guessedPlayer.position === currentPlayer.position,
        numberCorrect: guessedPlayer.number === currentPlayer.number,
        heightCorrect: guessedPlayer.height === currentPlayer.height,
        debutCorrect: guessedPlayer.debut === currentPlayer.debut,
        allStarCorrect: guessedPlayer.allStarAppearances === currentPlayer.allStarAppearances,
        nameCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
        overallCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
        numberHint: getArrow(guessedPlayer.number, currentPlayer.number),
        heightHint: getArrow(guessedPlayer.height, currentPlayer.height),
        debutHint: getArrow(guessedPlayer.debut, currentPlayer.debut),
        allStarHint: getArrow(guessedPlayer.allStarAppearances, currentPlayer.allStarAppearances)
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
        setInputDisabled(true); // Disable the input box
        setTimeout(() => {
          setShowSuccessModal(true);
        }, totalFlipTime);
      }
    } else {
      alert('Player not found. Try again!');
    }

    setGuess('');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setInputDisabled(false); // Re-enable input when modal is closed
  };

  const getPosition = (position) => {
    if (isSmallScreen) {
      switch (position) {
        case 'Point Guard':
          return 'PG';
        case 'Shooting Guard':
          return 'SG';
        case 'Small Forward':
          return 'SF';
        case 'Power Forward':
          return 'PF';
        case 'Center':
          return 'C';
        case 'Guard':
          return 'G';
        case 'Forward':
          return 'F';
        case 'Forward/Center':
          return "F/C";
        case 'Center/Forward':
          return "C/F";
        case 'Guard/Forward':
          return "G/F";
        case 'Forward/Guard':
          return "F/G";
        default:
          return position; // Return the full position if it doesn't match any case
      }
    }
    return position; // Return the full position if the screen is not small
  };

  return (
    <div className="app">
      <h1 className={isSmallScreen ? 'hidden-title' : ''}>SCALDLE</h1>
      <JerseysAnimation />

      <p>Guess the player: </p>
      {!inputDisabled && (
        <div className="input-container">
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
        </div>
      )}

      <div className="grid-container">
        <h2>Guesses:</h2>
        <div className="guess-grid">
          <div className="guess-header">
            <div>Name</div>
            <div>{isSmallScreen ? 'POS' : 'Position'}</div>
            <div>{isSmallScreen ? '#' : 'Number'}</div>
            <div>{isSmallScreen ? 'HT' : 'Height'}</div>
            <div>{isSmallScreen ? "C's Debut" : 'Celtic Debut'}</div>
            <div>{isSmallScreen ? "ASG's" : 'All Star Games'}</div>
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
                      {key === 'name' ? guesses[rowIndex][key] : null}
                      {key === 'position' ? getPosition(guesses[rowIndex][key]) : null}
                      {key === 'number' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].numberHint}` : null}
                      {key === 'height' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].heightHint}` : null}
                      {key === 'debut' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].debutHint}` : null}
                      {key === 'allStarAppearances' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].allStarHint}` : null}
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
            <p>You correctly guessed the player:</p>
            <p style={{ fontSize: '4rem', color: '#007A33' }}>{currentPlayer.name}</p>
            <p style={{ fontSize: '7rem', color: '#007A33' }}>{currentPlayer.number}</p>
            <button onClick={handleCloseModal} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
          </div>
        </div>
      )}

      {showFailureModal && (
        <FailureModal
          onClose={() => setShowFailureModal(false)}
          currentPlayer={currentPlayer}
        />
      )}
    </div>
  );
};

export default Game;
