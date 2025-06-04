import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/ProspectRanker-logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container container">
        <NavLink to="/" className="nav-logo">
          <img src={logo} alt="ProspectRanker Logo" />
        </NavLink>
        <input type="checkbox" id="nav-toggle" className="nav-toggle-checkbox" />
        <label htmlFor="nav-toggle" className="nav-toggle-label">
          <span></span>
        </label>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-links active' : 'nav-links')}>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/calculator" className={({ isActive }) => (isActive ? 'nav-links active' : 'nav-links')}>
              Calculator
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/rankings" className={({ isActive }) => (isActive ? 'nav-links active' : 'nav-links')}>
              Rankings
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/comparison" className={({ isActive }) => (isActive ? 'nav-links active' : 'nav-links')}>
              Compare
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;