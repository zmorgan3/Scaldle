import React from 'react';
import './StatsModal.css';
import GuessDistributionBar from './GuessDistributionBar';

const StatsModal = ({ stats, onClose }) => {
  const totalWins = stats.guessDistribution.reduce((acc, count) => acc + count, 0); // Total correct guesses
  const winPercentage = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1) : 0; // Calculate win percentage

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Game Stats</h2>

        {/* New header section for Wins, Games Played, and Win Percentage */}
        <div className="stats-header">
          <div className="header-item">
            <p>Wins</p>
            <p>{stats.wins}</p>
          </div>
          <div className="header-item">
            <p>Games Played</p>
            <p>{stats.gamesPlayed}</p>
          </div>
          <div className="header-item">
            <p>Win%</p>
            <p>{winPercentage}%</p>
          </div>
        </div>

        <h3>Guess Distribution:</h3>

        {/* Render GuessDistributionBar for each guess count */}
        {stats.guessDistribution.map((guessCount, index) => (
          <GuessDistributionBar
            key={index}
            guessCount={guessCount}
            totalGuesses={totalWins}
            count={index + 1} // 1 guess, 2 guesses, etc.
          />
        ))}

        <button onClick={onClose} className="modal-close-button">Close</button>
      </div>
    </div>
  );
};

export default StatsModal;
