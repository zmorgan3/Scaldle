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
  const [loading, setLoading] = useState(true); // Added loading state

  // Generate feedback for each guess
  const generateFeedback = (guessedPlayer, currentPlayer) => {
    const numberDifference = Math.abs(Number(guessedPlayer.number) - Number(currentPlayer.number));
    const debutDifference = Math.abs(Number(guessedPlayer.debut) - Number(currentPlayer.debut));
    const guessedHeightInches = convertHeightToInches(guessedPlayer.height);
    const targetHeightInches = convertHeightToInches(currentPlayer.height);
    const heightDifference = Math.abs(guessedHeightInches - targetHeightInches);
    const allStarDifference = Math.abs(Number(guessedPlayer.allStarAppearances) - Number(currentPlayer.allStarAppearances));

    const guessedPositions = guessedPlayer.position.split(/[/, ]+/);
    const targetPositions = currentPlayer.position.split(/[/, ]+/);
    const positionCorrect = guessedPositions.length === targetPositions.length &&
      guessedPositions.every(pos => targetPositions.includes(pos));
    const positionPartial = !positionCorrect && guessedPositions.some(pos => targetPositions.includes(pos));

    return {
      name: guessedPlayer.name,
      position: guessedPlayer.position,
      number: guessedPlayer.number,
      height: guessedPlayer.height,
      debut: guessedPlayer.debut,
      allStarAppearances: guessedPlayer.allStarAppearances,
      positionCorrect: positionCorrect,
      positionPartial: positionPartial,
      numberCorrect: guessedPlayer.number === currentPlayer.number,
      numberClose: numberDifference <= 5 && numberDifference !== 0,
      numberHint: getArrow(guessedPlayer.number, currentPlayer.number),
      heightCorrect: guessedPlayer.height === currentPlayer.height,
      heightClose: heightDifference <= 5 && heightDifference !== 0,
      heightHint: getArrow(guessedHeightInches, targetHeightInches),
      debutCorrect: guessedPlayer.debut === currentPlayer.debut,
      debutClose: debutDifference <= 5 && debutDifference !== 0,
      debutHint: getArrow(guessedPlayer.debut, currentPlayer.debut),
      allStarCorrect: Number(guessedPlayer.allStarAppearances) === Number(currentPlayer.allStarAppearances),
      allStarClose: allStarDifference <= 5 && allStarDifference !== 0,
      allStarHint: getArrow(Number(guessedPlayer.allStarAppearances), Number(currentPlayer.allStarAppearances)),
      nameCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
      overallCorrect: guessedPlayer.name.toLowerCase() === currentPlayer.name.toLowerCase(),
    };
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    const fetchGameState = async () => {
      const userId = localStorage.getItem('userId') || generateUserId();
      
      try {
        const response = await fetch(`https://celtics-trivia-backend1-6c0095e46832.herokuapp.com/game-state?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch game state');
        }
    
        const gameState = await response.json();
    
        const storedPlayer = JSON.parse(localStorage.getItem('currentPlayer'));
    
        // Ensure we have a current player, otherwise stop loading
        if (!storedPlayer) {
          console.error('No current player found in local storage.');
          setLoading(false); // Stop the loading spinner
          return;
        }
    
        // If no guesses exist or it's the user's first game, set guesses to an empty array
        const processedGuesses = (gameState.guesses && gameState.guesses.length > 0)
          ? gameState.guesses.map((savedGuess) => {
              const guessedPlayer = players.find(
                (player) => player.name.toLowerCase() === savedGuess.toLowerCase()
              );
              if (guessedPlayer) {
                const feedback = generateFeedback(guessedPlayer, storedPlayer);
                feedback.keys = ['name', 'position', 'number', 'height', 'debut', 'allStarAppearances'];
                return feedback;
              }
              return null;
            }).filter(Boolean) // Filter out any null values
          : []; // No guesses yet, initialize with an empty array
    
        setGuesses(processedGuesses); // Set the processed guesses
    
        // If the game is completed or max guesses reached, disable input
        if (gameState.isCompleted || processedGuesses.length >= MAX_GUESSES) {
          setInputDisabled(true);
        }
    
        // Flip animation logic for restored guesses
        processedGuesses.forEach((_, guessIndex) => {
          ['name', 'position', 'number', 'height', 'debut', 'allStarAppearances'].forEach((_, columnIndex) => {
            setTimeout(() => {
              setFlipped((prevFlipped) => [...prevFlipped, guessIndex * 6 + columnIndex]);
            }, columnIndex * FLIP_DELAY);
          });
        });
    
      } catch (error) {
        console.error('Error fetching game state:', error);
        setGuesses([]);  // Set guesses to an empty array in case of error
      } finally {
        setLoading(false);  // Ensure loading is stopped in all cases
      }
    };
    

    fetchGameState();
    loadPlayerOfTheDay();
    loadStats();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loadPlayerOfTheDay = async () => {
    try {
      const response = await fetch('https://celtics-trivia-backend1-6c0095e46832.herokuapp.com/daily-player');
      if (response.ok) {
        const player = await response.json();
        setCurrentPlayer(player);
        localStorage.setItem('currentPlayer', JSON.stringify(player));
      }
    } catch (error) {
      console.error('Error fetching player of the day:', error);
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
    const userId = localStorage.getItem('userId') || generateUserId();
  
    try {
      // Submit guess to the backend
      const response = await fetch('https://celtics-trivia-backend1-6c0095e46832.herokuapp.com/submit-guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, guess: guessedName }),
      });
  
      if (response.ok) {
        const guessedPlayer = players.find(
          (player) => player.name.toLowerCase() === guessedName.toLowerCase()
        );
  
        if (guessedPlayer) {
          const feedback = generateFeedback(guessedPlayer, currentPlayer);
  
          // Update guesses state and backend
          const updatedGuesses = [...guesses, feedback];
          setGuesses(updatedGuesses);
  
          // Send updated guesses array to the backend
          await fetch(`https://celtics-trivia-backend1-6c0095e46832.herokuapp.com/update-game-state`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              guesses: updatedGuesses.map(g => g.name),  // Send only the names of guessed players
            }),
          });
  
          // Add the animation effect for the flipping tiles
          feedback.keys = ['name', 'position', 'number', 'height', 'debut', 'allStarAppearances'];
          feedback.keys.forEach((_, index) => {
            const flipDelay = index === 0 ? 1000 : index * FLIP_DELAY;  // Delay the first flip by 300m
            setTimeout(() => {
              setFlipped((prev) => [...prev, guesses.length * 6 + index]);
            }, flipDelay);
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
      } else {
        console.error('Error submitting guess:', await response.json());
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  
    setGuess('');  // Reset input after submitting
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
      const rowString = guess.keys.map((key) => {
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
    
    // Add the URL to the end of the results string
    results += `\nhttps://russell-celticstrivia.com/`;
    
    return results;
  };
  

  return (
    <div className="app">
      <h1 className={isSmallScreen ? 'hidden-title' : ''}>RUSSELL</h1>
      <JerseysAnimation className="jersey-animation" />

      {loading ? (
        <div>Loading...</div> // Show loading while fetching data
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Game;
