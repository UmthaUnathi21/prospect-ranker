import React from 'react';

const LoadingSpinner = ({ message }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
