import React, { useState, useEffect } from 'react';
import './App.css';
import players from './players.json'; // Assuming player data is here

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
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check if the screen size is small (e.g., smartphone)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Adjust for screens smaller than 768px
    };

    // Set the initial screen size
    checkScreenSize();

    // Add a listener to detect window resizing
    window.addEventListener('resize', checkScreenSize);

    // Clean up the listener when the component is unmounted
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Function to compare number, height, or years and add arrows
  const compareNumberOrHeight = (guessedValue, targetValue) => {
    if (guessedValue < targetValue) {
      return `↑`; // Arrow pointing up if the target is higher
    } else if (guessedValue > targetValue) {
      return `↓`; // Arrow pointing down if the target is lower
    }
    return ''; // No arrow if the values are the same
  };

  // Function to compare the latest year in the player's range
  const compareYearsPlayed = (guessedYears, targetYears) => {
    const guessedLatestYear = Math.max(...guessedYears); // Get the latest year from the guessed range
    const targetLatestYear = Math.max(...targetYears); // Get the latest year from the target range
    return compareNumberOrHeight(guessedLatestYear, targetLatestYear);
  };

  // Function to convert the All-Star status based on screen size
  const getAllStarDisplay = (allStar) => {
    return isSmallScreen ? (allStar ? 'Y' : 'N') : (allStar ? 'All-Star' : 'Not All-Star');
  };

  // Function to convert the position based on screen size
  const getPositionDisplay = (position) => {
    if (isSmallScreen) {
      switch (position) {
        case 'Guard':
          return 'G';
        case 'Center':
          return 'C';
        case 'Forward':
          return 'F';
        default:
          return position;
      }
    } else {
      return position;
    }
  };

  // Function to get the column header based on screen size
  const getColumnHeader = (fullText, shortText) => {
    return isSmallScreen ? shortText : fullText;
  };

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

  const handleGuess = () => {
    if (guesses.length >= MAX_GUESSES) {
      return;
    }

    const guessedPlayer = players.find(
      (player) => player.name.toLowerCase() === guess.toLowerCase()
    );

    if (guessedPlayer) {
      const guessedYears = Array.isArray(guessedPlayer.yearsPlayed)
        ? guessedPlayer.yearsPlayed
        : [guessedPlayer.yearsPlayed]; // Ensure guessedPlayer.yearsPlayed is an array

      const targetYears = Array.isArray(currentPlayer.yearsPlayed)
        ? currentPlayer.yearsPlayed
        : [currentPlayer.yearsPlayed]; // Ensure currentPlayer.yearsPlayed is an array

      const feedback = {
        name: guessedPlayer.name,
        position: guessedPlayer.position,
        number: guessedPlayer.number,
        height: guessedPlayer.height,
        yearsPlayed: guessedYears,
        allStar: guessedPlayer.allStar,
        numberComparison: compareNumberOrHeight(guessedPlayer.number, currentPlayer.number), // Compare numbers
        heightComparison: compareNumberOrHeight(guessedPlayer.height, currentPlayer.height), // Compare heights
        yearsPlayedComparison: compareYearsPlayed(guessedYears, targetYears), // Compare years played
        positionCorrect: guessedPlayer.position === currentPlayer.position,
        numberCorrect: guessedPlayer.number === currentPlayer.number,
        heightCorrect: guessedPlayer.height === currentPlayer.height,
        yearsPlayedCorrect: guessedYears.join(',') === targetYears.join(','), // Check if years are exactly the same
        allStarCorrect: guessedPlayer.allStar === currentPlayer.allStar,
        overallCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
      };

      setGuesses([...guesses, feedback]);

      feedback.keys = ['name', 'position', 'number', 'height', 'yearsPlayed', 'allStar'];
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
      } else if (guesses.length + 1 >= MAX_GUESSES) {
        setTimeout(() => {
          setShowModal(true);
        }, totalFlipTime);
      }
    } else {
      alert('Player not found. Try again!');
    }

    setGuess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowSuccessModal(false);
    setGuesses([]);
    setFlipped([]);
    setCurrentPlayer(players[Math.floor(Math.random() * players.length)]);
  };

  return (
    <div className="app">
      <h1>Celtics Player Guessing Game</h1>

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
            <div>{getColumnHeader("Number", "#")}</div> {/* Update Number header */}
            <div>{getColumnHeader("Height", "HT")}</div> {/* Update Height header */}
            <div>Years Played</div>
            <div>All-Star</div>
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
                      {key === 'position'
                        ? getPositionDisplay(guesses[rowIndex][key])
                        : key === 'allStar'
                        ? getAllStarDisplay(guesses[rowIndex][key])
                        : key === 'number'
                        ? `${guesses[rowIndex][key]} ${guesses[rowIndex].numberComparison}` // Add arrow for number comparison
                        : key === 'height'
                        ? `${guesses[rowIndex][key]} ${guesses[rowIndex].heightComparison}` // Add arrow for height comparison
                        : key === 'yearsPlayed'
                        ? `${guesses[rowIndex][key].join('-')} ${guesses[rowIndex].yearsPlayedComparison}` // Ensure yearsPlayed is joined and show arrow
                        : guesses[rowIndex][key]}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Game Over!</h2>
            <p>The correct player was: {currentPlayer.name}</p>
            <button onClick={handleCloseModal}>Play Again</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Congratulations!</h2>
            <p>You correctly guessed the player: {currentPlayer.name}</p>
            <button onClick={handleCloseModal}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
