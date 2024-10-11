import React, { useState, useEffect } from 'react';
import './JerseysAnimation.css'; // We'll handle styling here

const JerseysAnimation = () => {
  const numberOfJerseys = 1; // Adjust how many jerseys you want to show
  const jerseys = Array(numberOfJerseys).fill('scalabrine.png'); // Use the same image

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Delay to trigger the animation
    setTimeout(() => setAnimate(true), 1000); // Animation starts after 1 second
  }, []);

  return (
    <div className="jerseys-container">
      {jerseys.map((jersey, index) => (
        <img
          key={index}
          src={require(`./images/${jersey}`)} // Use require to load the image dynamically
          alt={`Celtics Jersey ${index + 1}`}
          className={`jersey ${animate ? 'animate-in' : ''}`}
        />
      ))}
    </div>
  );
};

export default JerseysAnimation;
