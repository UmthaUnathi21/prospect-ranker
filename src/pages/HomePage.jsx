import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page container">
      <header className="home-header">
        <h1>Chart Your Course to the Pros</h1>
        <p className="subtitle">
          Input your stats, benchmark against NBA & NCAA D1 players, discover your statistical twins,
          and estimate your probability of making it to the next level.
        </p>
        <Link to="/calculator" className="btn btn-primary-home">Get Started</Link>
      </header>

      <section className="features-overview">
        <h2>How ProspectRanker Works</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3>Stat Input & Profile</h3>
            <p>Enter your per-game statistics, age, and current competition level to create your unique player profile.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Probability Engine</h3>
            <p>Our algorithm provides a heuristic estimate of your chances to reach NCAA D1 and the NBA based on your data.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <h3>Dynamic Rankings</h3>
            <p>See where your stats place you among current NBA and NCAA players across various categories.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>Player Comparison</h3>
            <p>Find professional and collegiate players whose statistical output most closely matches yours.</p>
          </div>
        </div>
      </section>

      <section className="call-to-action">
        <h2>Ready to See Your Potential?</h2>
        <p>
          Whether you're a rising star or a dedicated grinder, ProspectRanker offers insights to fuel your journey.
          Start by entering your stats in the calculator.
        </p>
        <Link to="/calculator" className="btn btn-secondary">Analyze My Stats</Link>
      </section>
    </div>
  );
};

export default HomePage;