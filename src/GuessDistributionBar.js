import React from 'react';
import './GuessDistributionBar.css';

const GuessDistributionBar = ({ guessCount, totalGuesses, count }) => {
  const barWidth = totalGuesses > 0 ? (guessCount / totalGuesses) * 100 : 0;
  const adjustedWidth = guessCount === 0 ? 10 : barWidth; // Slightly fill in for zero guesses

  return (
    <div className="guess-bar-container">
      <div className="guess-label">
        {count} Guess{count > 1 ? 'es' : ''}
      </div>
      <div className="guess-bar">
        <div
          className={`filled-bar ${guessCount === 0 ? 'zero-bar' : ''}`}
          style={{ width: `${adjustedWidth}%` }}
        >
          <span className="guess-count">{guessCount > 0 ? `${guessCount}x` : '0x'}</span>
        </div>
      </div>
    </div>
  );
};

export default GuessDistributionBar;
