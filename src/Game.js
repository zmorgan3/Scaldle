import React, { useState, useEffect } from 'react';
import './App.css';
import './Game.css';
import players from './players.json';
import JerseysAnimation from './JerseysAnimation';
import GuessGrid from './GuessGrid';
import FailureModal from './FailureModal';
import ToastNotification from './ToastNotification';

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
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [gameEnded, setGameEnded] = useState(false); // New state for tracking if game has ended

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
    handleGuess(name);
    setFilteredPlayers([]);
  };

  const getArrow = (guessedValue, targetValue) => {
    if (guessedValue < targetValue) {
      return '↑';
    } else if (guessedValue > targetValue) {
      return '↓';
    }
    return '';
  };

  const handleGuess = (guessedName) => {
    if (guesses.length >= MAX_GUESSES) {
      if (guesses.length === MAX_GUESSES) {
        setShowFailureModal(true); // Show failure modal if guesses are exhausted
      }
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
        setInputDisabled(true);
        setTimeout(() => {
          setShowSuccessModal(true);
        }, totalFlipTime);
        setGameEnded(true); // Mark the game as ended
      }

      // Show failure modal if the player has used all guesses and the guess is incorrect
      if (guesses.length === MAX_GUESSES - 1 && !feedback.overallCorrect) {
        setTimeout(() => {
          setShowFailureModal(true);
          setGameEnded(true); // Mark the game as ended
        }, totalFlipTime);
      }
    } else {
      alert('Player not found. Try again!');
    }

    setGuess('');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setShowFailureModal(false);
    setInputDisabled(true);
    setGameEnded(true); // Ensure the game is marked as ended when modals close
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
        case 'Fwrd/Cen':
          return "F/C";
        case 'Center/Fwrd':
          return "C/F";
        case 'Guard/Fwrd':
          return "G/F";
        case 'Fwrd/Guard':
          return "F/G";
        default:
          return position; 
      }
    }
    return position; 
  };

  const handleCopyResults = () => {
    const results = generateResultsString();
    navigator.clipboard.writeText(results).then(() => {
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000); 
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  const generateResultsString = () => {
    let results = `Daily SCALDLE:\n`;
    guesses.forEach((guess) => {
      const rowString = guess.keys.map((key, index) => {
        if (guess[`${key}Correct`]) {
          return '🟩'; 
        }
        if (guess.nameCorrect && key === 'position') {
          return '🟨'; 
        }
        return '⬛'; 
      }).join('');
      results += rowString + '\n';
    });
    return results;
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
            <p>You correctly guessed today's player:</p>
            <p style={{ fontSize: '3rem', color: '#007A33' }}>{currentPlayer.name}</p>
            <p style={{ fontSize: '6rem', color: '#007A33' }}>{currentPlayer.number}</p>
            <p>Come back tomorrow to try again!</p>
            <button onClick={handleCloseModal} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
            {gameEnded && ( // Show button only if the game has ended
              <button onClick={handleCopyResults} style={{ marginTop: '20px', cursor: 'pointer' }}>Copy Results</button>
            )}
          </div>
        </div>
      )}

      {showFailureModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Game Over!</h2>
            <p>You did not guess the correct player. Today's player was:</p>
            <p style={{ fontSize: '3rem', color: '#007A33' }}>{currentPlayer.name}</p>
            <p style={{ fontSize: '5rem', color: '#007A33' }}>{currentPlayer.number}</p>
            <p>Come back tomorrow to try again!</p>
            <button onClick={handleCloseModal} style={{ marginTop: '20px', cursor: 'pointer' }}>X</button>
            {gameEnded && ( // Show button only if the game has ended
              <button onClick={handleCopyResults} style={{ marginTop: '20px', cursor: 'pointer' }}>Copy Results</button>
            )}
          </div>
        </div>
      )}

      {showCopyMessage && (
        <div className="toast-notification">Results Copied!</div>
      )}

    {gameEnded && ( // Show button only if the game has ended
              <button onClick={handleCopyResults} style={{ marginTop: '20px', cursor: 'pointer' }}>Copy Results</button>
            )}
    </div>
  );
};

export default Game;
