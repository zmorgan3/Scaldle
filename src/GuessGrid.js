import React from 'react';
import './GuessGrid.css'; // Assuming you have some CSS for styling

const GuessGrid = ({ guesses, flipped, isSmallScreen, getPosition }) => {
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
          <div>{isSmallScreen ? "ASG's" : 'All Star Games'}</div>
        </div>

        {[...Array(8)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`guess-row ${rowIndex < guesses.length ? '' : 'skeleton'}`}
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 1fr' }}
          >
            {rowIndex < guesses.length ? (
              guesses[rowIndex].keys.map((key, index) => (
                <div
                  key={index}
                  className={`guess-item flip ${flipped.includes(rowIndex * 6 + index) ? 'flip-active' : ''}`}
                  style={{ animationDelay: `${0.2 * index}s` }}
                >
                  <div className="flip-front"></div>
                  <div className={`flip-back ${key === 'number' && guesses[rowIndex].numberCorrect ? 'correct' 
                                  : key === 'number' && guesses[rowIndex].numberClose ? 'yellow' 
                                  : key === 'debut' && guesses[rowIndex].debutCorrect ? 'correct'
                                  : key === 'debut' && guesses[rowIndex].debutClose ? 'yellow'
                                  : key === 'height' && guesses[rowIndex].heightCorrect ? 'correct'
                                  : key === 'height' && guesses[rowIndex].heightClose ? 'yellow'
                                  : key === 'allStarAppearances' && guesses[rowIndex].allStarCorrect ? 'correct'
                                  : guesses[rowIndex][`${key}Correct`] ? 'correct' : 'incorrect'}`}>
                    {key === 'name' ? guesses[rowIndex][key] : null}
                    {key === 'position' ? getPosition(guesses[rowIndex][key]) : null}
                    {key === 'number' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].numberHint}` : null}
                    {key === 'height' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].heightHint}` : null}
                    {key === 'debut' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].debutHint}` : null}
                    {key === 'allStarAppearances' ? `${guesses[rowIndex][key]} ${guesses[rowIndex].allStarHint}` : null}
                  </div>
                </div>
              ))
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
