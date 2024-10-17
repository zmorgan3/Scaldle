import React, { useEffect } from 'react';
import './GuessGrid.css';

const GuessGrid = ({ guesses = [], flipped, isSmallScreen }) => {  // Default `guesses` to an empty array
  useEffect(() => {
    console.log('Guesses updated:', guesses); // Check if guesses update properly
  }, [guesses]);

  const getPosition = (position) => {
    if (window.innerWidth < 913) {
      switch (position) {
        case 'Guard':
          return 'G';
        case 'Forward':
          return 'F';
        case 'Center':
          return 'C';
        case 'Center/Forward':
          return 'C/F';
        case 'Forward/Center':
          return 'F/C';
        case 'Guard/Forward':
          return 'G/F';
        default:
          return position;
      }
    }
    return position;
  };

  const getBackgroundColor = (key, feedback) => {
    if (key === 'allStarAppearances') {
      if (feedback.allStarCorrect) return 'correct';
      if (feedback.allStarClose) return 'yellow';
      return 'incorrect';
    }
    if (key === 'position') {
      if (feedback.positionCorrect) return 'correct';
      if (feedback.positionPartial) return 'yellow';
      return 'incorrect';
    }
    if (feedback[`${key}Correct`]) return 'correct';
    if (feedback[`${key}Close`]) return 'yellow';
    return 'incorrect';
  };

  return (
    <div className="grid-container">
      <h2>Guesses:</h2>
      <div className="guess-grid">
        <div className="guess-header">
          <div>Name</div>
          <div>{isSmallScreen ? 'POS' : 'Position'}</div>
          <div>{isSmallScreen ? '#' : 'Number'}</div>
          <div>{isSmallScreen ? 'HT' : 'Height'}</div>
          <div>{isSmallScreen ? "C's Debut" : 'Celtic Debut'}</div>
          <div>{isSmallScreen ? "ASG's" : 'All-Star Games'}</div>
        </div>

        {/* Render all 8 rows, whether they contain guesses or skeletons */}
        {[...Array(8)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`guess-row ${rowIndex < guesses.length ? '' : 'skeleton'}`} 
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 1fr' }}
          >
            {/* Render the guessed player's details if we have a guess for this row */}
            {rowIndex < guesses.length ? (
              // Ensure guess object and `keys` exist
              guesses[rowIndex] && guesses[rowIndex].keys ? (
                guesses[rowIndex].keys.map((key, index) => {
                  const backgroundColorClass = getBackgroundColor(key, guesses[rowIndex]);

                  return (
                    <div
                      key={index}
                      className={`guess-item flip ${flipped.includes(rowIndex * 6 + index) ? 'flip-active' : ''}`}
                    >
                      <div className="flip-front"></div>
                      <div className={`flip-back ${backgroundColorClass}`}>
                        {key === 'name' && guesses[rowIndex][key]}
                        {key === 'position' && getPosition(guesses[rowIndex][key])}
                        {key === 'number' && `${guesses[rowIndex][key]} ${guesses[rowIndex].numberHint}`}
                        {key === 'height' && `${guesses[rowIndex][key]} ${guesses[rowIndex].heightHint}`}
                        {key === 'debut' && `${guesses[rowIndex][key]} ${guesses[rowIndex].debutHint}`}
                        {key === 'allStarAppearances' && `${guesses[rowIndex][key]} ${guesses[rowIndex].allStarHint}`}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>Error: Invalid guess data</div>
              )
            ) : (
              // Render skeletons for empty rows
              <>
                <div className="guess-item skeleton-item"></div>
                <div className="guess-item skeleton-item"></div>
                <div className="guess-item skeleton-item"></div>
                <div className="guess-item skeleton-item"></div>
                <div className="guess-item skeleton-item"></div>
                <div className="guess-item skeleton-item"></div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuessGrid;
