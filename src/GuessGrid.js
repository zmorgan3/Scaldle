import React from 'react';
import './GuessGrid.css';

const GuessGrid = ({ guesses, flipped, isSmallScreen }) => {
  if (!Array.isArray(guesses)) {
    console.error("Guesses is not defined or not an array:", guesses);
    return null; // Return null or a fallback if guesses is not an array
  }

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
          return 'F/G';
        default:
          return position;
      }
    }
    return position;
  };

  const getBackgroundColor = (key, feedback) => {
    if (key === 'allStarAppearances') {
      if (feedback.allStarCorrect) {
        return 'correct';
      }
      if (feedback.allStarClose) {
        return 'yellow';
      }
      return 'incorrect';
    }

    if (key === 'position') {
      if (feedback.positionCorrect) {
        return 'correct';
      }
      if (feedback.positionPartial) {
        return 'yellow';
      }
      return 'incorrect';
    }

    if (feedback[`${key}Correct`]) {
      return 'correct';
    }

    if (feedback[`${key}Close`]) {
      return 'yellow';
    }

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

        {[...Array(8)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`guess-row ${rowIndex < guesses.length ? '' : 'skeleton'}`}
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 1fr' }}
          >
            {rowIndex < guesses.length ? (
              guesses[rowIndex].keys.map((key, index) => {
                const backgroundColorClass = getBackgroundColor(key, guesses[rowIndex]);
                console.log(`Assigning color class: ${backgroundColorClass} for key: ${key}`);

                return (
                  <div
                    key={index}
                    className={`guess-item flip ${flipped.includes(rowIndex * 6 + index) ? 'flip-active' : ''}`}
                  >
                    <div className="flip-front"></div>
                    <div className={`flip-back ${backgroundColorClass}`}>
                      {key === 'name' ? guesses[rowIndex][key] : null}
                      {key === 'position' ? getPosition(guesses[rowIndex][key]) : null}
                      {key === 'number' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].numberHint}` : null}
                      {key === 'height' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].heightHint}` : null}
                      {key === 'debut' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].debutHint}` : null}
                      {key === 'allStarAppearances' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].allStarHint}` : null}
                    </div>
                  </div>
                );
              })
            ) : (
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
