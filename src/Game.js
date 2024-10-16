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
import { convertHeightToInches, getArrow } from './gameUtils';
import CopyResultsBar from './CopyResultsBar';

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
  
    loadPlayerOfTheDay(); // Fetch player of the day
    loadStats();
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

  const loadPlayerOfTheDay = async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
  
    if (lastPlayedDate == today) { //CHANGE THIS
      console.log('Fetching Player of the Day...');
      try {
        const response = await fetch('http://localhost:5001/daily-player');
        if (response.ok) {
          const player = await response.json();
          setCurrentPlayer(player);
          localStorage.setItem('currentPlayer', JSON.stringify(player));
          localStorage.setItem('lastPlayedDate', today);
        } else {
          console.error('Failed to fetch player of the day');
        }
      } catch (error) {
        console.error('Error fetching player of the day:', error);
      }
    } else {
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

  const handleGuess = async (guessedName) => {
    const userId = localStorage.getItem('userId') || generateUserId(); // Generate or fetch a unique user ID
  
    try {
      const response = await fetch('http://localhost:5001/submit-guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, guess: guessedName }),
      });
  
      if (response.ok) {
        const userGuessData = await response.json();
        if (userGuessData && Array.isArray(userGuessData.guesses)) {
          // Ensure each guess has a `keys` array
          const updatedGuesses = userGuessData.guesses.map((guess) => ({
            ...guess,
            keys: guess.keys || ['name', 'position', 'number', 'height', 'debut', 'allStarAppearances'],
          }));
  
          setGuesses(updatedGuesses);
  
          // Update flipped state for animations
          const newFlipped = [];
          updatedGuesses.forEach((_, rowIndex) => {
            updatedGuesses[rowIndex].keys.forEach((_, index) => {
              newFlipped.push(rowIndex * 6 + index);
            });
          });
          setFlipped(newFlipped);
        } else {
          console.error('Invalid response structure from backend.');
        }
  
        // Handle success modal if player is guessed correctly
        if (userGuessData.isCompleted && guessedName.toLowerCase() === currentPlayer.name.toLowerCase()) {
          setShowSuccessModal(true);
          setInputDisabled(true);
          updateStatsOnWin(userGuessData.guesses.length);
        }
  
        // Handle failure modal if max attempts reached
        if (userGuessData.isCompleted && guessedName.toLowerCase() !== currentPlayer.name.toLowerCase()) {
          setShowFailureModal(true);
          setInputDisabled(true);
        }
      } else {
        console.error('Error submitting guess:', await response.json());
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };
  
  
  const generateUserId = () => {
    const userId = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('userId', userId);
    return userId;
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
    let results = `Daily RUSSELL:\n`;
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
      <h1 className={isSmallScreen ? 'hidden-title' : ''}>RUSSELL</h1>
      <JerseysAnimation className="jersey-animation"/>

      {
  !inputDisabled ? (
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
  )
}


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
