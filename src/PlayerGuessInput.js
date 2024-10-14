import React, { useState } from 'react';
import './PlayerGuessInput.css';
import players from './players.json';

const PlayerGuessInput = ({ guess, setGuess, handleGuess, inputDisabled, MAX_GUESSES, guesses }) => {
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setGuess(value);

    if (value) {
      const filtered = players.filter((player) =>
        player.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setGuess(name);
    handleGuess(name);
    setFilteredPlayers([]);
  };

  return (
    <div className="input-container">
      <p>Guess the Celtic: </p>
      {!inputDisabled && (
        <>
          <input
            type="text"
            value={guess}
            onChange={handleInputChange}
            placeholder="Enter player name"
            disabled={guesses.length >= MAX_GUESSES}
            className="player-input"
          />
          {filteredPlayers.length > 0 && (
            <ul className="suggestions">
              {filteredPlayers.slice(0, 5).map((player, index) => (
                <li key={index} onClick={() => handleSuggestionClick(player.name)} className="suggestion-item">
                  {player.name}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default PlayerGuessInput;
