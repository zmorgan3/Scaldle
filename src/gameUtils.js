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
  