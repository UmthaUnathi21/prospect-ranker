import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import RankingsPage from './pages/RankingsPage';
import ComparisonPage from './pages/ComparisonPage';
import { DataProvider } from './contexts/DataContext';
import './App.css';

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;