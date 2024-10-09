import React from 'react';
import './ToastNotification.css';

const ToastNotification = ({ message }) => {
  return (
    <div className="toast-notification">
      {message}
    </div>
  );
};

export default ToastNotification;
