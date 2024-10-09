// gameUtils.js
export const convertHeightToInches = (heightStr) => {
  const [feet, inches] = heightStr.split("'").map((part) => parseInt(part, 10));
  return feet * 12 + (inches || 0);
};

export const getArrow = (guessedValue, targetValue) => {
  if (guessedValue < targetValue) {
      return '↑';
  } else if (guessedValue > targetValue) {
      return '↓';
  }
  return '';
};

export const comparePositions = (guessedPosition, targetPosition) => {
  const guessedPositions = new Set(guessedPosition.split('/').map(pos => pos.trim()));
  const targetPositions = new Set(targetPosition.split('/').map(pos => pos.trim()));

  const isExactMatch = guessedPosition === targetPosition;
  const hasPartialMatch = [...guessedPositions].some(pos => targetPositions.has(pos));

  return { isExactMatch, hasPartialMatch };
};