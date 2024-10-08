import React, { useState, useEffect } from 'react';
import './App.css';
import './Game.css';
import players from './players.json';
import JerseysAnimation from './JerseysAnimation';
import GuessGrid from './GuessGrid';
import FailureModal from './FailureModal';
import SuccessModal from './SuccessModal';
import ToastNotification from './ToastNotification';
import StatsModal from './StatsModal';
import PlayerGuessInput from './PlayerGuessInput';
import { convertHeightToInches, getArrow } from './gameUtils'; // Add this line


const MAX_GUESSES = 8;
const FLIP_DURATION = 800;
const FLIP_DELAY = 400;

const Game = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null); // No initial player yet
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false); // State to toggle stats modal
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

    // Load player of the day and stats when the component mounts
    loadPlayerOfTheDay();
    loadStats();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loadPlayerOfTheDay = () => {
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    if (lastPlayedDate !== today) {
      // It's a new day, so set a new random player
      const newPlayer = players[Math.floor(Math.random() * players.length)];
      setCurrentPlayer(newPlayer);
      localStorage.setItem('currentPlayer', JSON.stringify(newPlayer));
      localStorage.setItem('lastPlayedDate', today);
    } else {
      // Load the saved player of the day
      const savedPlayer = JSON.parse(localStorage.getItem('currentPlayer'));
      setCurrentPlayer(savedPlayer);
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

  const handleGuess = (guessedName) => {
    if (guesses.length >= MAX_GUESSES) {
      if (guesses.length === MAX_GUESSES) {
        setShowFailureModal(true);
      }
      return;
    }

    const guessedPlayer = players.find(
      (player) => player.name.toLowerCase() === guessedName.toLowerCase()
    );

    if (guessedPlayer) {
      const numberDifference = Math.abs(guessedPlayer.number - currentPlayer.number);
      const debutDifference = Math.abs(guessedPlayer.debut - currentPlayer.debut);
      const guessedHeightInches = convertHeightToInches(guessedPlayer.height);
      const targetHeightInches = convertHeightToInches(currentPlayer.height);
      const heightDifference = Math.abs(guessedHeightInches - targetHeightInches);
      const allStarDifference = Math.abs(guessedPlayer.allStarAppearances - currentPlayer.allStarAppearances);

      const feedback = {
        name: guessedPlayer.name,
        position: guessedPlayer.position,
        number: guessedPlayer.number,
        height: guessedPlayer.height,
        debut: guessedPlayer.debut,
        allStarAppearances: guessedPlayer.allStarAppearances,
        positionCorrect: guessedPlayer.position === currentPlayer.position,
        numberCorrect: guessedPlayer.number === currentPlayer.number,
        numberClose: numberDifference <= 5 && numberDifference !== 0,
        numberHint: getArrow(guessedPlayer.number, currentPlayer.number),
        heightCorrect: guessedPlayer.height === currentPlayer.height,
        heightClose: heightDifference <= 5 && heightDifference !== 0,
        heightHint: getArrow(guessedHeightInches, targetHeightInches),
        debutCorrect: guessedPlayer.debut === currentPlayer.debut,
        debutClose: debutDifference <= 5 && debutDifference !== 0,
        debutHint: getArrow(guessedPlayer.debut, currentPlayer.debut),
        allStarCorrect: guessedPlayer.allStarAppearances === currentPlayer.allStarAppearances,
        allStarClose: allStarDifference <= 5 && allStarDifference !== 0, // Correct logic for closeness
        allStarHint: getArrow(guessedPlayer.allStarAppearances, currentPlayer.allStarAppearances),
        nameCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
        overallCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
      };

      // Pass feedback for each guess into the GuessGrid component
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
          updateStatsOnWin(guesses.length + 1);
        }, totalFlipTime);
      }

      if (guesses.length === MAX_GUESSES - 1 && !feedback.overallCorrect) {
        setTimeout(() => {
          setShowFailureModal(true);
          updateStatsOnLoss();
        }, totalFlipTime);
      }
    } else {
      alert('Player not found. Try again!');
    }

    setGuess('');
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
    navigator.clipboard.writeText(results).then(() => {
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  const toggleStatsModal = () => {
    setShowStatsModal(!showStatsModal);
  };

  const generateResultsString = () => {
    let results = `Daily SCALDLE:\n`;
    guesses.forEach((guess) => {
      const rowString = guess.keys.map((key, index) => {
        if (guess[`${key}Correct`]) {
          return '🟩';
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
        // Ensure the 'allStarClose' condition comes before 'allStarCorrect'
        if (key === 'allStarAppearances' && guess.allStarClose) {
          return '🟨';
        }
        if (key === 'allStarAppearances' && guess.allStarCorrect) {
          return '🟩';
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

      {/* Use the new PlayerGuessInput component */}
      <PlayerGuessInput
        guess={guess}
        setGuess={setGuess}
        handleGuess={handleGuess}
        inputDisabled={inputDisabled}
        MAX_GUESSES={MAX_GUESSES}
        guesses={guesses}
      />

      {/* Pass the guesses feedback to GuessGrid */}
      <GuessGrid
        guesses={guesses}
        flipped={flipped}
        isSmallScreen={isSmallScreen}
      />

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

      {showCopyMessage && (
        <ToastNotification message="Results Copied!" />
      )}

      <button onClick={toggleStatsModal} className="stats-button">
        Stats
      </button>

      {showStatsModal && <StatsModal stats={stats} onClose={toggleStatsModal} />}
    </div>
  );
};

export default Game;
