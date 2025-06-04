import React, { useState, useEffect } from 'react'; // Import necessary React hooks and components.
import { useData } from '../contexts/DataContext'; // Import the data context to access and manage shared application data (user stats, player benchmarks).
import StatInputForm from '../components/StatInputForm'; // Import the form component used for user stat input.
import LoadingSpinner from '../components/LoadingSpinner'; // Import the loading spinner component for user feedback during data fetching.
import { STAT_FIELDS_CONFIG } from '../config/formConfig'; // Import configuration for stat input fields, likely defining their names, types, options, etc.
import './CalculatorPage.css'; // Import styles specific to the CalculatorPage.

const calculateProbability = (userData, nbaPlayers, ncaaPlayers) => {
  if (!userData || (!nbaPlayers?.length && !ncaaPlayers?.length)) return null;// Error handler: If essential data is missing, cannot perform calculation.

  
  let score = 0;// Initialize score, this will be a cumulative value based on various factors.
  const maxScore = 100; // Define the maximum possible score to cap the calculated score.

  // Define weights for different competition levels, where higher levels contribute more to the score.
  // These weights are somewhat subjective and part of the model's heuristic.
  const levelWeights = {
    recreational: 0.02, high_school_jv: 0.05, high_school_varsity: 0.1, high_school_varsity_elite: 0.2,
    college_club: 0.15, college_juco_elite: 0.3, // Junior college elite.
    college_d3: 0.25, college_d2: 0.35, college_d1_low: 0.45, // NCAA Divisions.
    college_d1_mid: 0.55, college_d1_high: 0.65, // Higher tiers of NCAA D1.
    pro_overseas_low: 0.5, pro_overseas_mid: 0.6, pro_overseas_high: 0.75, // Professional overseas leagues.
    nba_g_league: 0.8, nba_prospect: 0.85 // NBA G League and direct NBA prospects.
  };
  
  score += (levelWeights[userData.CompetitionLevel] || 0) * 25; // Add to score based on competition level, scaled by a factor (e.g., 25 points of the total score potential).

  // Adjust score based on age - younger age range gets a boost, and older ages get a penalty.
  // This reflects typical athletic peak and development primes.
  if (userData.Age >= 16 && userData.Age <= 23) score += 10; // Prime athletic window.
  else if (userData.Age > 28 && userData.Age <=32) score -= 5; // Past typical peak for prospects.
  else if (userData.Age > 32) score -=10; // Significantly past typical peak

  const relevantNcaaBenchmarkPlayers = ncaaPlayers?.filter(p => p.Games > 10 && p.Minutes > 150 && p.Team !== "USER") || []; // Filter NCAA players to create a relevant benchmark group.
  
  let statContribution = 0; // Initialize contribution from statistical performance.
  if (relevantNcaaBenchmarkPlayers.length > 5) {
      const statsToCompare = ["Points", "Rebounds", "Assists", "PlayerEfficiencyRating", "FieldGoalsPercentage", "ThreePointersPercentage"]; // Define which stats to compare against the NCAA benchmarks.
      const statWeight = 50 / statsToCompare.length; // Distribute the weight for stat comparison evenly among the selected stats.

      statsToCompare.forEach(statKey => { // Calculate stat contribution.
        const userStat = userData[statKey]; 
        if (userStat === undefined || userStat === null) return;

        const statValues = relevantNcaaBenchmarkPlayers.map(p => p[statKey]).filter(s => s !== undefined && s !== null && !isNaN(s)); // Get all valid values for the current stat from the benchmark players.
        if (statValues.length === 0) return;

        statValues.sort((a, b) => a - b); // Calculate percentile.
        let percentileRank = 0;
        const userStatNum = parseFloat(userStat);
        if (!isNaN(userStatNum)) { // Calculate percentile rank of user.
            const countBelowOrEqual = statValues.filter(s => parseFloat(s) <= userStatNum).length; // Calculate percentile rank of benchmarker.
            percentileRank = (countBelowOrEqual / statValues.length);
        }
        statContribution += percentileRank * statWeight; // Add percentile rank to stat contribution.
      });
  } else {
    // This offers a less nuanced calculation but objectively measures performance.
    if (userData.PlayerEfficiencyRating && userData.PlayerEfficiencyRating > 15) statContribution += 10;
    if (userData.PlayerEfficiencyRating && userData.PlayerEfficiencyRating > 20) statContribution += 10; // Additional bonus for higher PER
  }
  
  score += statContribution; // Addition of the calculated stat contribution to main score.

  
  let finalScore = Math.max(0, Math.min(score, maxScore)); // Final score must be within the 0 to maxScore.

  
  let ncaaProbability = 0; // NCAA & NBA probabilities.
  let nbaProbability = 0;

  // Calculate NCAA D1 probability based on competition level and final score.
  if (userData.CompetitionLevel.includes('college_d1')) {
    ncaaProbability = Math.min(90, finalScore * 0.8 + 20); // Higher base and cap for current D1 players.
  } else if (userData.CompetitionLevel.includes('college_d2') || userData.CompetitionLevel.includes('college_d3') || userData.CompetitionLevel.includes('juco_elite')) {
    ncaaProbability = Math.min(80, finalScore * 0.9); // Mid-tier college levels.
  } else if (userData.CompetitionLevel.includes('high_school_varsity_elite')) {
    ncaaProbability = Math.min(70, finalScore * 0.8); // Elite high school players.
  } else {
    ncaaProbability = Math.min(60, finalScore * 0.7); // Other, lower, levels.
  }
  ncaaProbability = Math.max(1, ncaaProbability); // NCAA probability must be at least 1% if any score is generated, preventing 0 for plausible candidates.

  // Calculate NBA probability based on competition level and final score. NBA probability is generally lower and requires a higher threshold.
  if (userData.CompetitionLevel === 'nba_g_league' || userData.CompetitionLevel === 'nba_prospect' || userData.CompetitionLevel.includes('pro_overseas_high')) {
    // Players already in or very near pro/NBA feeder systems.
    nbaProbability = Math.min(50, (finalScore - 40) * 0.8); // Requires a decent score to even start registering
  } else if (userData.CompetitionLevel.includes('college_d1_high') && finalScore > 75) {
    // High-level D1 players with high scores have a shot.
    nbaProbability = Math.min(30, (finalScore - 60) * 0.7);
  } else if (finalScore > 85) {
    // Exceptional scores from other levels might indicate NBA potential.
    nbaProbability = Math.min(15, (finalScore - 75) * 0.5);
  }
  nbaProbability = Math.max(0, nbaProbability); // Same as NCAA - NBA probability cannot be negative.

  // Display calculated probabilities and the final debug score, formatted to one decimal place.
  return {
    ncaa: parseFloat(ncaaProbability.toFixed(1)),
    nba: parseFloat(nbaProbability.toFixed(1)),
    debugScore: parseFloat(finalScore.toFixed(1)) // Useful for understanding the model's output.
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

// Export the CalculatorPage component for use in other parts of the application
export default CalculatorPage;
