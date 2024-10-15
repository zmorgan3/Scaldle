import React from 'react';
import './GuessDistributionBar.css';

const GuessDistributionBar = ({ guessCount, totalGuesses, count, minNonZeroBarWidth }) => {
  const barWidth = totalGuesses > 0 ? (guessCount / totalGuesses) * 100 : 0;

  // If the guess count is zero, ensure its width doesn't exceed the minimum non-zero bar width
  const adjustedWidth = guessCount === 0 && minNonZeroBarWidth ? minNonZeroBarWidth : barWidth;

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
