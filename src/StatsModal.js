import React from 'react';
import './StatsModal.css';
import GuessDistributionBar from './GuessDistributionBar';

const StatsModal = ({ stats, onClose }) => {
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
          <GuessDistributionBar key={index} guessCount={guessCount} totalGuesses={stats.gamesPlayed} count={index + 1} />
        ))}
        <button onClick={onClose} className="modal-close-button">Close</button>
      </div>
    </div>
  );
};

export default StatsModal;
