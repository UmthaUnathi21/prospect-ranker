import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import PlayerCard from '../components/PlayerCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  MIN_GAMES_PLAYED_NBA,
  MIN_MINUTES_NBA,
  MIN_GAMES_PLAYED_NCAA,
  MIN_MINUTES_NCAA
} from '../config/constants';
import './ComparisonPage.css';

const SIMILARITY_STATS_WEIGHTS = {
  Points: 1.5, Rebounds: 1.2, Assists: 1.3, Steals: 0.8, BlockedShots: 0.8,
  FieldGoalsPercentage: 1.5, ThreePointersPercentage: 1.3, FreeThrowsPercentage: 0.7,
  PlayerEfficiencyRating: 2.0,
  Turnovers: -0.5,
  Minutes: 0.5,
};

const STAT_NORMALIZATION_FACTORS = {
    Points: 30, Rebounds: 15, Assists: 10, Steals: 3, BlockedShots: 3,
    FieldGoalsPercentage: 30, ThreePointersPercentage: 30, FreeThrowsPercentage: 30,
    PlayerEfficiencyRating: 20, Turnovers: 5, Minutes: 20
};


const calculateSimilarityScore = (user, player) => {
  let similaritySum = 0;
  let totalWeightApplied = 0;

  if (!user || !player) return -Infinity;

  for (const stat in SIMILARITY_STATS_WEIGHTS) {
    const userStat = user[stat];
    const playerStat = player[stat];
    const weight = SIMILARITY_STATS_WEIGHTS[stat];

    if (userStat !== undefined && userStat !== null && !isNaN(parseFloat(userStat)) &&
        playerStat !== undefined && playerStat !== null && !isNaN(parseFloat(playerStat))) {
      
      let diff = parseFloat(userStat) - parseFloat(playerStat);
      const normalizationFactor = STAT_NORMALIZATION_FACTORS[stat] || 1;
      const normalizedDifference = Math.abs(diff) / normalizationFactor;

      if (weight < 0) {
         similaritySum -= diff * weight; 
      } else {
         similaritySum += (1 - Math.min(normalizedDifference, 1)) * weight;
      }
      totalWeightApplied += Math.abs(weight);
    }
  }
  return totalWeightApplied > 0 ? (similaritySum / totalWeightApplied) * 100 : 0;
};


const ComparisonPage = () => {
  const { nbaPlayers, ncaaPlayers, userData, loading, error } = useData();
  const [league, setLeague] = useState('nba');
  const [numComparisons, setNumComparisons] = useState(5);

  const playersForComparison = useMemo(() => {
    const source = league === 'nba' ? nbaPlayers : ncaaPlayers;
    const minGames = league === 'nba' ? MIN_GAMES_PLAYED_NBA : MIN_GAMES_PLAYED_NCAA;
    const minMinutes = league === 'nba' ? MIN_MINUTES_NBA : MIN_MINUTES_NCAA;
    return source.filter(p => p.Games >= minGames && p.Minutes >= minMinutes && p.PlayerID !== 'USER_PLAYER');
  }, [league, nbaPlayers, ncaaPlayers]);

  const similarPlayers = useMemo(() => {
    if (!userData || !playersForComparison?.length) return [];

    return playersForComparison
      .map(player => ({
        player,
        similarityScore: calculateSimilarityScore(userData, player),
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, numComparisons);

  }, [userData, playersForComparison, numComparisons]);

  if (loading && (!nbaPlayers?.length && !ncaaPlayers?.length)) return (
    <div className="container"><LoadingSpinner message="Loading player data for comparisons..." /></div>
  );
  if (error) return <div className="container error-message">Error loading base player data: {error}</div>;

  if (!userData) {
    return (
      <div className="container comparison-page">
        <h1 className="page-title">Player Comparison</h1>
        <p className="page-intro">
          Please <Link to="/calculator" className="inline-link">enter your stats</Link> first to see player comparisons.
        </p>
      </div>
    );
  }

  return (
    <div className="comparison-page container">
      <h1 className="page-title">Statistical Player Comparison</h1>
      <p className="page-intro">
        Based on your profile, here are players in the {league.toUpperCase()} with the most similar statistical output.
        Similarity is determined by a weighted model across key performance indicators.
      </p>

      <div className="controls card comparison-controls">
        <div className="control-group league-toggle">
          <button onClick={() => setLeague('nba')} className={`btn ${league === 'nba' ? 'active' : ''}`}>NBA</button>
          <button onClick={() => setLeague('ncaa')} className={`btn ${league === 'ncaa' ? 'active' : ''}`}>NCAA</button>
        </div>
        <div className="control-group num-results-selector">
          <label htmlFor="num-comparisons">Show Top: </label>
          <select
            id="num-comparisons"
            value={numComparisons}
            onChange={(e) => setNumComparisons(parseInt(e.target.value))}
          >
            <option value="3">3 Players</option>
            <option value="5">5 Players</option>
            <option value="10">10 Players</option>
          </select>
        </div>
      </div>

      {userData && (
         <div className="user-profile-summary card">
            <h3>Your Comparison Profile: {userData.Name}</h3>
            <PlayerCard player={userData} isUserPlayer={true} league="Your Input" />
        </div>
      )}

      <div className="similar-players-list">
        <h2>Most Similar Players in {league.toUpperCase()}:</h2>
        {loading && similarPlayers.length === 0 && <LoadingSpinner message={`Calculating comparisons for ${league.toUpperCase()}...`} />}
        {!loading && similarPlayers.length > 0 ? (
          similarPlayers.map(({ player, similarityScore }, index) => (
            <div key={player.PlayerID || `${player.Name}-${index}-${player.Team}`} className="comparison-item">
              <PlayerCard player={player} rank={index + 1} league={league.toUpperCase()} />
              <p className="similarity-score">Similarity: {similarityScore.toFixed(1)}%</p>
            </div>
          ))
        ) : (
          !loading && <p className="no-results">No comparable players found for {league.toUpperCase()} based on your profile and current filters.</p>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;