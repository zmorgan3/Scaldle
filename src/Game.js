import React, { useState, useEffect } from 'react';
import './App.css';
import './Game.css';
import JerseysAnimation from './JerseysAnimation';
import GuessGrid from './GuessGrid';
import FailureModal from './FailureModal';
import SuccessModal from './SuccessModal';
import ToastNotification from './ToastNotification';
import StatsModal from './StatsModal';
import PlayerGuessInput from './PlayerGuessInput';
import CopyResultsBar from './CopyResultsBar';
import { v4 as uuidv4 } from 'uuid';

const MAX_GUESSES = 8;
const FLIP_DURATION = 800;
const FLIP_DELAY = 400;

const Game = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState({
    wins: 0,
    gamesPlayed: 0,
    guessDistribution: Array(MAX_GUESSES).fill(0),
  });

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    loadPlayerOfTheDay();
    loadStats();
    initializeUserId();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const initializeUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('userId', userId);
    }
  };

  const loadPlayerOfTheDay = async () => {
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    const today = new Date().toISOString().split('T')[0];

    if (lastPlayedDate !== today) {
      // Fetch the player of the day from the backend
      try {
        const response = await fetch('http://localhost:3000/daily-player');
        const newPlayer = await response.json();
        setCurrentPlayer(newPlayer);
        localStorage.setItem('currentPlayer', JSON.stringify(newPlayer));
        localStorage.setItem('lastPlayedDate', today);
        setInputDisabled(false); // Enable input for new day
        setGuesses([]); // Reset guesses for the new day
      } catch (error) {
        console.error('Failed to fetch player of the day:', error);
      }
    } else {
      const savedPlayer = JSON.parse(localStorage.getItem('currentPlayer'));
      setCurrentPlayer(savedPlayer);
      const playedToday = localStorage.getItem('playedToday');
      if (playedToday === 'true') {
        setInputDisabled(true);
      }
    }
  };

  const loadStats = () => {
    const savedStats = JSON.parse(localStorage.getItem('gameStats'));
    if (savedStats) {
      setStats(savedStats);
    }
  };

  const saveStats = (updatedStats) => {
    setStats(updatedStats);
    localStorage.setItem('gameStats', JSON.stringify(updatedStats));
  };

  const handleGuess = async (guessedName) => {
    if (guesses.length >= MAX_GUESSES) {
      if (guesses.length === MAX_GUESSES) {
        setShowFailureModal(true);
      }
      return;
    }

    try {
      console.log('Submitting guess:', guessedName); // Log guess being sent to the server

      const response = await fetch('http://localhost:3000/submit-guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          guess: guessedName,
        }),
      });      

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response received from server:', result); // Log server response

      if (result.message === 'Correct!' || result.message === 'Incorrect!') {
        const feedback = result.feedback;
        console.log('Feedback:', feedback); // Log feedback received from the server

        setGuesses([...guesses, feedback]); // Add feedback to the guesses array

        // Flipping logic based on the new guess added
        feedback.keys.forEach((_, index) => {
          setTimeout(() => {
            setFlipped((prev) => [...prev, guesses.length * feedback.keys.length + index]);
          }, index * FLIP_DELAY);
        });

        const totalFlipTime = feedback.keys.length * FLIP_DELAY + FLIP_DURATION;

        // Handling win or loss condition
        if (result.message === 'Correct!') {
          setInputDisabled(true);
          setTimeout(() => {
            setShowSuccessModal(true);
            updateStatsOnWin(guesses.length + 1);
          }, totalFlipTime);
          localStorage.setItem('playedToday', 'true');
        } else if (guesses.length === MAX_GUESSES - 1) {
          setTimeout(() => {
            setShowFailureModal(true);
            updateStatsOnLoss();
          }, totalFlipTime);
          localStorage.setItem('playedToday', 'true');
        }
      }
    } catch (error) {
      console.error('Failed to submit guess:', error); // Log any errors that occur during fetch
    }

    setGuess(''); // Clear the input field after each guess
  };

  const updateStatsOnWin = (guessesTaken) => {
    const updatedStats = {
      ...stats,
      wins: stats.wins + 1,
      gamesPlayed: stats.gamesPlayed + 1,
    };
    updatedStats.guessDistribution[guessesTaken - 1] += 1;
    saveStats(updatedStats);
  };

  const updateStatsOnLoss = () => {
    const updatedStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
    };
    saveStats(updatedStats);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setShowFailureModal(false);
    setInputDisabled(true);
  };

  const handleCopyResults = () => {
    const results = generateResultsString();
    navigator.clipboard
      .writeText(results)
      .then(() => {
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  const toggleStatsModal = () => {
    setShowStatsModal(!showStatsModal);
  };

  const generateResultsString = () => {
    let results = `Daily RUSSELL:\n`;
    guesses.forEach((guess) => {
      const rowString = guess.keys
        .map((key, index) => {
          if (guess[`${key}Correct`]) {
            return '🟩';
          }
          if (key === 'allStarAppearances' && guess.allStarCorrect) {
            return '🟩';
          }
          if (key === 'position' && guess.positionPartial) {
            return '🟨';
          }
          if (key === 'number' && guess.numberClose) {
            return '🟨';
          }
          if (key === 'debut' && guess.debutClose) {
            return '🟨';
          }
          if (key === 'height' && guess.heightClose) {
            return '🟨';
          }
          if (key === 'allStarAppearances' && guess.allStarClose) {
            return '🟨';
          }
          return '⬛';
        })
        .join('');
      results += rowString + '\n';
    });
    return results;
  };

  return (
    <div className="app">
      <h1 className={isSmallScreen ? 'hidden-title' : ''}>RUSSELL</h1>
      <JerseysAnimation className="jersey-animation" />

      {!inputDisabled ? (
        <PlayerGuessInput
          guess={guess}
          setGuess={setGuess}
          handleGuess={handleGuess}
          inputDisabled={inputDisabled}
          MAX_GUESSES={MAX_GUESSES}
          guesses={guesses}
        />
      ) : (
        <CopyResultsBar handleCopyResults={handleCopyResults} />
      )}

      <GuessGrid guesses={guesses} flipped={flipped} isSmallScreen={isSmallScreen} />

      {showSuccessModal && (
        <SuccessModal
          currentPlayer={currentPlayer}
          handleCloseModal={handleCloseModal}
          handleCopyResults={handleCopyResults}
        />
      )}

      {showFailureModal && (
        <FailureModal
          currentPlayer={currentPlayer}
          handleCloseModal={handleCloseModal}
          handleCopyResults={handleCopyResults}
        />
      )}

      {showCopyMessage && <ToastNotification message="Results Copied!" />}

      <button onClick={toggleStatsModal} className="stats-button">
        Stats
      </button>

      {showStatsModal && <StatsModal stats={stats} onClose={toggleStatsModal} />}
    </div>
  );
};

export default Game;