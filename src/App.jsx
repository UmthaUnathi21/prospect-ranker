import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import RankingsPage from './pages/RankingsPage';
import ComparisonPage from './pages/ComparisonPage';
import { DataProvider } from './contexts/DataContext';
import './App.css';

// This is a new layout component for pages that should have the Navbar and Footer.
const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet /> {/* Nested routes (HomePage, CalculatorPage, etc.) will render here. */}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          {/* Route for the Landing Page (loads first at the root path). */}
          {/* This route does not need a Navbar/Footer. */}
          <Route path="/" element={<LandingPage />} />

          {/* Parent route for pages that will need the Navbar and Footer. */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} /> {/* HomePage is now at /home. */}
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;