import React from 'react';

const GuessInput = ({ guess, handleInputChange, filteredPlayers, handleSuggestionClick, inputDisabled }) => {
  return (
    <div>
      <input
        type="text"
        value={guess}
        onChange={handleInputChange}
        placeholder="Enter player name"
        disabled={inputDisabled}
      />
      {filteredPlayers.length > 0 && (
        <ul className="suggestions">
          {filteredPlayers.slice(0, 5).map((player, index) => (
            <li key={index} onClick={() => handleSuggestionClick(player.name)}>
              {player.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GuessInput;
