import React from 'react';
import './StatsModal.css';
import GuessDistributionBar from './GuessDistributionBar';

const StatsModal = ({ stats, onClose }) => {
  // Find the minimum width for bars with non-zero guesses
  const nonZeroGuessCounts = stats.guessDistribution.filter(count => count > 0);
  const minNonZeroBarWidth = nonZeroGuessCounts.length > 0
    ? (Math.min(...nonZeroGuessCounts) / stats.gamesPlayed) * 100
    : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Game Stats</h2>
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
            <p>{(stats.wins / stats.gamesPlayed * 100).toFixed(1)}%</p>
          </div>
        </div>
        <h3>Guess Distribution:</h3>
        {stats.guessDistribution.map((guessCount, index) => (
          <GuessDistributionBar 
            key={index} 
            guessCount={guessCount} 
            totalGuesses={stats.gamesPlayed} 
            count={index + 1} 
            minNonZeroBarWidth={minNonZeroBarWidth} // Pass the minimum non-zero width
          />
        ))}
        <button onClick={onClose} className="modal-close-button">Close</button>
      </div>
    </div>
  );
};

export default StatsModal;
