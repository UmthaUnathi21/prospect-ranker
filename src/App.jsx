import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage'; // Assuming LandingPage.jsx is in a 'pages' folder
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import RankingsPage from './pages/RankingsPage';
import ComparisonPage from './pages/ComparisonPage';
import { DataProvider } from './contexts/DataContext';
import './App.css';

// This is a new layout component for pages that should have the Navbar and Footer
const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet /> {/* Nested routes (HomePage, CalculatorPage, etc.) will render here */}
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
          {/* Route for the Landing Page (loads first at the root path) */}
          {/* This route does NOT use MainLayout, so no Navbar/Footer */}
          <Route path="/" element={<LandingPage />} />

          {/* Parent route for pages that DO need the Navbar and Footer */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} /> {/* HomePage is now at /home */}
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            {/* Add any other routes that need Navbar/Footer here */}
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;