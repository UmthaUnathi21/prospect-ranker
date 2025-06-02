import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container container">
        <p>&copy; {new Date().getFullYear()} ProspectRanker. All Rights Reserved.</p>
        <p>
          Data sourced from <a href="https://sportsdata.io" target="_blank" rel="noopener noreferrer">SportsData.io</a>.
        </p>
        <p className="footer-disclaimer">
          This tool is for informational and illustrative purposes only.
          Probabilities and comparisons are based on statistical models and do not guarantee future success.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
