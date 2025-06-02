import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import StatInputForm from '../components/StatInputForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { STAT_FIELDS_CONFIG } from '../config/formConfig';
import './CalculatorPage.css';

const calculateProbability = (userData, nbaPlayers, ncaaPlayers) => {
  if (!userData || (!nbaPlayers?.length && !ncaaPlayers?.length)) return null;

  let score = 0;
  const maxScore = 100;

  const levelWeights = {
    recreational: 0.02, high_school_jv: 0.05, high_school_varsity: 0.1, high_school_varsity_elite: 0.2,
    college_club: 0.15, college_juco_elite: 0.3,
    college_d3: 0.25, college_d2: 0.35, college_d1_low: 0.45,
    college_d1_mid: 0.55, college_d1_high: 0.65,
    pro_overseas_low: 0.5, pro_overseas_mid: 0.6, pro_overseas_high: 0.75,
    nba_g_league: 0.8, nba_prospect: 0.85
  };
  score += (levelWeights[userData.CompetitionLevel] || 0) * 25;

  if (userData.Age >= 16 && userData.Age <= 23) score += 10;
  else if (userData.Age > 28 && userData.Age <=32) score -= 5;
  else if (userData.Age > 32) score -=10;

  const relevantNcaaBenchmarkPlayers = ncaaPlayers?.filter(p => p.Games > 10 && p.Minutes > 150 && p.Team !== "USER") || [];
  
  let statContribution = 0;
  if (relevantNcaaBenchmarkPlayers.length > 5) {
      const statsToCompare = ["Points", "Rebounds", "Assists", "PlayerEfficiencyRating", "FieldGoalsPercentage", "ThreePointersPercentage"];
      const statWeight = 50 / statsToCompare.length;

      statsToCompare.forEach(statKey => {
        const userStat = userData[statKey];
        if (userStat === undefined || userStat === null) return;

        const statValues = relevantNcaaBenchmarkPlayers.map(p => p[statKey]).filter(s => s !== undefined && s !== null && !isNaN(s));
        if (statValues.length === 0) return;

        statValues.sort((a, b) => a - b);
        
        let percentileRank = 0;
        const userStatNum = parseFloat(userStat);
        if (!isNaN(userStatNum)) {
            const countBelowOrEqual = statValues.filter(s => parseFloat(s) <= userStatNum).length;
            percentileRank = (countBelowOrEqual / statValues.length);
        }
        statContribution += percentileRank * statWeight;
      });
  } else {
    if (userData.PlayerEfficiencyRating && userData.PlayerEfficiencyRating > 15) statContribution += 10;
    if (userData.PlayerEfficiencyRating && userData.PlayerEfficiencyRating > 20) statContribution += 10;
  }
  score += statContribution;

  let finalScore = Math.max(0, Math.min(score, maxScore));
  let ncaaProbability = 0;
  let nbaProbability = 0;

  if (userData.CompetitionLevel.includes('college_d1')) {
    ncaaProbability = Math.min(90, finalScore * 0.8 + 20);
  } else if (userData.CompetitionLevel.includes('college_d2') || userData.CompetitionLevel.includes('college_d3') || userData.CompetitionLevel.includes('juco_elite')) {
    ncaaProbability = Math.min(80, finalScore * 0.9);
  } else if (userData.CompetitionLevel.includes('high_school_varsity_elite')) {
    ncaaProbability = Math.min(70, finalScore * 0.8);
  } else {
    ncaaProbability = Math.min(60, finalScore * 0.7);
  }
  ncaaProbability = Math.max(1, ncaaProbability);

  if (userData.CompetitionLevel === 'nba_g_league' || userData.CompetitionLevel === 'nba_prospect' || userData.CompetitionLevel.includes('pro_overseas_high')) {
    nbaProbability = Math.min(50, (finalScore - 40) * 0.8);
  } else if (userData.CompetitionLevel.includes('college_d1_high') && finalScore > 75) {
    nbaProbability = Math.min(30, (finalScore - 60) * 0.7);
  } else if (finalScore > 85) {
     nbaProbability = Math.min(15, (finalScore - 75) * 0.5);
  }
  nbaProbability = Math.max(0, nbaProbability);

  return {
    ncaa: parseFloat(ncaaProbability.toFixed(1)),
    nba: parseFloat(nbaProbability.toFixed(1)),
    debugScore: parseFloat(finalScore.toFixed(1))
  };
};


const CalculatorPage = () => {
  const { setUserData: setGlobalUserData, userData: initialUserData, nbaPlayers, ncaaPlayers, loading: dataLoading, error: dataError } = useData();
  const [calculatedProb, setCalculatedProb] = useState(null);
  const [currentUserStats, setCurrentUserStats] = useState(null);

  useEffect(() => {
    if (initialUserData) {
        setCurrentUserStats(initialUserData);
        if (nbaPlayers.length > 0 || ncaaPlayers.length > 0) {
             const probability = calculateProbability(initialUserData, nbaPlayers, ncaaPlayers);
             setCalculatedProb(probability);
        }
    }
  }, [initialUserData, nbaPlayers, ncaaPlayers]);


  const handleFormSubmit = (submittedData) => {
    setGlobalUserData(submittedData);
    setCurrentUserStats(submittedData);
    if (nbaPlayers.length > 0 || ncaaPlayers.length > 0 || submittedData.CompetitionLevel) {
        const probability = calculateProbability(submittedData, nbaPlayers, ncaaPlayers);
        setCalculatedProb(probability);
    } else {
        console.warn("Player data not yet loaded for probability calculation.");
    }
  };

  if (dataLoading && (!nbaPlayers?.length && !ncaaPlayers?.length)) return (
    <div className="container">
      <LoadingSpinner message="Loading player data for calculations..." />
    </div>
  );

  return (
    <div className="calculator-page container">
      <h1 className="page-title">Prospect Potential Calculator</h1>
      <p className="page-intro">
        Input your per-game stats, age, and competition level. Our tool estimates your probability of reaching NCAA D1 and the NBA.
        This is a simplified model for motivation and insight.
      </p>
      {dataError && <p className="error-message">Error loading base player data: {dataError}. Calculations may be affected.</p>}

      <StatInputForm onSubmit={handleFormSubmit} initialData={initialUserData} />

      {currentUserStats && (
        <div className="results-display card">
          <h2 className="results-title">Your Profile & Potential</h2>
          <div className="profile-summary">
            <h3>{currentUserStats.Name}</h3>
            <p><strong>Age:</strong> {currentUserStats.Age}</p>
            <p><strong>Level:</strong> {STAT_FIELDS_CONFIG.find(f=>f.name==="CompetitionLevel")?.options.find(o => o.value === currentUserStats.CompetitionLevel)?.label || currentUserStats.CompetitionLevel}</p>
            <h4>Key Stats:</h4>
            <ul className="stats-list">
              <li>PPG: {currentUserStats.Points?.toFixed(1)}</li>
              <li>RPG: {currentUserStats.Rebounds?.toFixed(1)}</li>
              <li>APG: {currentUserStats.Assists?.toFixed(1)}</li>
              <li>FG%: {currentUserStats.FieldGoalsPercentage?.toFixed(1)}%</li>
              {currentUserStats.ThreePointersPercentage !== undefined && <li>3P%: {currentUserStats.ThreePointersPercentage?.toFixed(1)}%</li>}
              <li>PER (est.): {currentUserStats.PlayerEfficiencyRating?.toFixed(1)}</li>
            </ul>
          </div>

          {calculatedProb && (
            <div className="probability-results">
              <h3>Probability Estimation</h3>
              <div className="probability-meters">
                <div className="prob-item">
                  <span className="prob-league">NCAA D1</span>
                  <div className="meter-bar-container">
                    <div className="meter-bar ncaa-bar" style={{ width: `${calculatedProb.ncaa}%` }}>
                      {calculatedProb.ncaa}%
                    </div>
                  </div>
                </div>
                <div className="prob-item">
                  <span className="prob-league">NBA</span>
                   <div className="meter-bar-container">
                    <div className="meter-bar nba-bar" style={{ width: `${calculatedProb.nba}%` }}>
                       {calculatedProb.nba}%
                    </div>
                  </div>
                </div>
              </div>
              <p className="disclaimer">
                <strong>Disclaimer:</strong> This probability is a heuristic estimate based on a simplified statistical model and your current competition level. It does not account for intangibles, physical attributes, specific skill sets beyond these stats, or future development.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;
