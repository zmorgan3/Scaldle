import React, { useState, useEffect, useCallback } from 'react';
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
import { convertHeightToInches, getArrow } from './gameUtils';

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
  const [gameFinished, setGameFinished] = useState(false); 
  const [stats, setStats] = useState({
    wins: 0,
    gamesPlayed: 0,
    guessDistribution: Array(MAX_GUESSES).fill(0),
  });

  // Memoized loadPlayerOfTheDay to prevent unnecessary re-renders
  const loadPlayerOfTheDay = useCallback(() => {
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    const today = new Date().toISOString().split('T')[0];

    if (lastPlayedDate !== today) {
      // New day, select a new player and reset the game state
      const newPlayer = players[Math.floor(Math.random() * players.length)];
      setCurrentPlayer(newPlayer);
      localStorage.setItem('currentPlayer', JSON.stringify(newPlayer));
      localStorage.setItem('lastPlayedDate', today);
      resetGameState(); // Reset the game for the new day
    } else {
      // Use the saved player from localStorage
      const savedPlayer = JSON.parse(localStorage.getItem('currentPlayer'));
      setCurrentPlayer(savedPlayer);
    }
  }, []); // Memoized function with no dependencies

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    // Load player of the day and game state when the component mounts
    loadPlayerOfTheDay();
    loadGameState();
    loadStats();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [loadPlayerOfTheDay]); // Added loadPlayerOfTheDay as a dependency

  const loadGameState = () => {
    const savedGuesses = JSON.parse(localStorage.getItem('guesses'));
    const savedFlipped = JSON.parse(localStorage.getItem('flipped'));
    const savedGameFinished = JSON.parse(localStorage.getItem('gameFinished'));

    if (savedGuesses && savedFlipped && savedGameFinished !== null) {
      setGuesses(savedGuesses);
      setFlipped(savedFlipped);
      setGameFinished(savedGameFinished);
      if (savedGameFinished) {
        setInputDisabled(true); // Disable input if the game was already finished
      }
    }
  };

  const resetGameState = () => {
    setGuesses([]);
    setFlipped([]);
    setGameFinished(false);
    localStorage.removeItem('guesses');
    localStorage.removeItem('flipped');
    localStorage.removeItem('gameFinished');
  };

  const saveGameState = (updatedGuesses, updatedFlipped, gameFinishedState) => {
    localStorage.setItem('guesses', JSON.stringify(updatedGuesses));
    localStorage.setItem('flipped', JSON.stringify(updatedFlipped));
    localStorage.setItem('gameFinished', JSON.stringify(gameFinishedState));
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
    if (guesses.length >= MAX_GUESSES || gameFinished) {
      return; // Prevent further guesses if the game is finished
    }

    const guessedPlayer = players.find(
      (player) => player.name.toLowerCase() === guessedName.toLowerCase()
    );

    if (guessedPlayer) {
      const numberDifference = Math.abs(Number(guessedPlayer.number) - Number(currentPlayer.number));
      const debutDifference = Math.abs(Number(guessedPlayer.debut) - Number(currentPlayer.debut));
      const guessedHeightInches = convertHeightToInches(guessedPlayer.height);
      const targetHeightInches = convertHeightToInches(currentPlayer.height);
      const heightDifference = Math.abs(guessedHeightInches - targetHeightInches);
      const allStarDifference = Math.abs(Number(guessedPlayer.allStarAppearances) - Number(currentPlayer.allStarAppearances));

      // Split positions of both guessed and current player
      const guessedPositions = guessedPlayer.position.split(/[\/, ]+/); // Split guessed player's positions into an array
      const targetPositions = currentPlayer.position.split(/[\/, ]+/);   // Split target player's positions into an array

      // Check if the positions match exactly
      const positionCorrect = guessedPositions.length === targetPositions.length &&
                            guessedPositions.every(pos => targetPositions.includes(pos));

      // Check for partial match when the positions partially match
      const positionPartial = !positionCorrect && guessedPositions.some(pos => targetPositions.includes(pos));

      const feedback = {
        name: guessedPlayer.name,
        position: guessedPlayer.position,
        number: guessedPlayer.number,
        height: guessedPlayer.height,
        debut: guessedPlayer.debut,
        allStarAppearances: guessedPlayer.allStarAppearances,
        // Check for correct or partial position match
        positionCorrect: positionCorrect,
        positionPartial: positionPartial, // Yellow for partial match
        numberCorrect: guessedPlayer.number === currentPlayer.number,
        numberClose: numberDifference <= 5 && numberDifference !== 0,
        numberHint: getArrow(guessedPlayer.number, currentPlayer.number),
        heightCorrect: guessedPlayer.height === currentPlayer.height,
        heightClose: heightDifference <= 5 && heightDifference !== 0,
        heightHint: getArrow(guessedHeightInches, targetHeightInches),
        debutCorrect: guessedPlayer.debut === currentPlayer.debut,
        debutClose: debutDifference <= 5 && debutDifference !== 0,
        debutHint: getArrow(guessedPlayer.debut, currentPlayer.debut),
        // Fixing the ASG appearances logic
        allStarCorrect: Number(guessedPlayer.allStarAppearances) === Number(currentPlayer.allStarAppearances),
        allStarClose: allStarDifference <= 5 && allStarDifference !== 0,
        allStarHint: getArrow(guessedPlayer.allStarAppearances, currentPlayer.allStarAppearances),
        nameCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
        overallCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
      };

      const updatedGuesses = [...guesses, feedback];
      setGuesses(updatedGuesses);

      feedback.keys = ['name', 'position', 'number', 'height', 'debut', 'allStarAppearances'];
      feedback.keys.forEach((_, index) => {
        setTimeout(() => {
          setFlipped((prev) => [...prev, guesses.length * 6 + index]);
        }, index * FLIP_DELAY);
      });

      const totalFlipTime = feedback.keys.length * FLIP_DELAY + FLIP_DURATION;

      if (feedback.overallCorrect) {
        setInputDisabled(true);
        setGameFinished(true);
        setTimeout(() => {
          setShowSuccessModal(true);
          updateStatsOnWin(updatedGuesses.length);
        }, totalFlipTime);
        saveGameState(updatedGuesses, flipped, true); // Save game as finished
      }

      if (updatedGuesses.length === MAX_GUESSES && !feedback.overallCorrect) {
        setTimeout(() => {
          setShowFailureModal(true);
          updateStatsOnLoss();
          setGameFinished(true);
          saveGameState(updatedGuesses, flipped, true); // Save game as finished
        }, totalFlipTime);
      }

      saveGameState(updatedGuesses, flipped, gameFinished); // Save guesses and game state
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
      }).join('');
      results += rowString + '\n';
    });
    return results;
  };

  return (
    <div className="app">
      <h1 className={isSmallScreen ? 'hidden-title' : ''}>SCALDLE</h1>
      <JerseysAnimation />

      <PlayerGuessInput
        guess={guess}
        setGuess={setGuess}
        handleGuess={handleGuess}
        inputDisabled={inputDisabled || gameFinished} 
        MAX_GUESSES={MAX_GUESSES}
        guesses={guesses}
      />

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
