// ToastNotification.js
import React from 'react';
import './ToastNotification.css'; // Import your CSS for styling

const ToastNotification = ({ message, onClose }) => {
  return (
    <div className="toast-notification">
      {message}
      <button className="close-button" onClick={onClose}>X</button>
    </div>
  );
};

export default ToastNotification;
