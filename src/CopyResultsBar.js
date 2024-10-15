import React from 'react';
import './CopyResultsBar.css';

const CopyResultsBar = ({ handleCopyResults }) => {
  return (
    <div className="copy-results-bar">
      <button onClick={handleCopyResults} className="copy-button">Copy Today's Results</button>
    </div>
  );
};

export default CopyResultsBar;
