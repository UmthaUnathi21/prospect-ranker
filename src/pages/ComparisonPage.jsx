import React, { useState, useMemo } from 'react'; // Import React hooks for state management (useState) and memoization (useMemo).
import { useData } from '../contexts/DataContext';// Import the data context to access shared application data like player stats and user data.
import PlayerCard from '../components/PlayerCard'; // Import the PlayerCard component for displaying individual player information.
import LoadingSpinner from '../components/LoadingSpinner'; // Import the LoadingSpinner component for user feedback during data operations.
import { Link } from 'react-router-dom'; // Import Link component from react-router-dom for navigation.
import { // Import constants defining minimum play criteria for filtering players.
  MIN_GAMES_PLAYED_NBA,
  MIN_MINUTES_NBA,
  MIN_GAMES_PLAYED_NCAA,
  MIN_MINUTES_NCAA
} from '../config/constants';
import './ComparisonPage.css'; // Import styles specific to the ComparisonPage.

// Define weights for each statistic used in the similarity calculation. Higher values mean the stat is considered more important for similarity.
const SIMILARITY_STATS_WEIGHTS = {
  Points: 1.5, Rebounds: 1.2, Assists: 1.3, Steals: 0.8, BlockedShots: 0.8,
  FieldGoalsPercentage: 1.5, ThreePointersPercentage: 1.3, FreeThrowsPercentage: 0.7,
  PlayerEfficiencyRating: 2.0, // Of high importance.
  Turnovers: -0.5, // Negative impact on similarity if user has more and player has less, or vice-versa.
  Minutes: 0.5, // Consider minutes played for role comparison.
};

// Define normalization factors for each statistic. These are used to bring differences in various stats to a comparable scale.
const STAT_NORMALIZATION_FACTORS = {
    Points: 30, 
    Rebounds: 15, 
    Assists: 10,  
    Steals: 3,    
    BlockedShots: 3, 
    FieldGoalsPercentage: 30, 
    ThreePointersPercentage: 30, 
    FreeThrowsPercentage: 30, 
    PlayerEfficiencyRating: 20, 
    Turnovers: 5, 
    Minutes: 20
};

const calculateSimilarityScore = (user, player) => {
  let similaritySum = 0;
  let totalWeightApplied = 0;

  // Error Handler - If user or player data is missing, cannot calculate.
  if (!user || !player) return -Infinity;

  for (const stat in SIMILARITY_STATS_WEIGHTS) {
    const userStat = user[stat];
    const playerStat = player[stat];
    const weight = SIMILARITY_STATS_WEIGHTS[stat];

    if (userStat !== undefined && userStat !== null && !isNaN(parseFloat(userStat)) && // Check if both user and player have valid, numerical data for current stat.
        playerStat !== undefined && playerStat !== null && !isNaN(parseFloat(playerStat))) {

      let diff = parseFloat(userStat) - parseFloat(playerStat); // Calculate the raw difference between the user's stat and player's stat.
      const normalizationFactor = STAT_NORMALIZATION_FACTORS[stat] || 1;
      const normalizedDifference = Math.abs(diff) / normalizationFactor; // Calculate the normalized difference, ensuring it's an absolute value.

      // For stats with negative weights (e.g., Turnovers), the logic is different.
      if (weight < 0) {
          // If userStat is higher (e.g. more turnovers), diff is positive. diff * weight becomes more negative, reducing similaritySum.
          similaritySum += (1 - Math.min(normalizedDifference, 1)) * weight;
      } else {
          similaritySum += (1 - Math.min(normalizedDifference, 1)) * weight;// Positively weighted stats, higher similarity adds more to the score.
      }
      totalWeightApplied += Math.abs(weight);
    }
  }
  return totalWeightApplied > 0 ? (similaritySum / totalWeightApplied) * 100 : 0; // Calculate final similarity score: (sum of weighted similarities / sum of absolute weights applied) * 100. And gives a percentage score.
};

const ComparisonPage = () => {
  const { nbaPlayers, ncaaPlayers, userData, loading, error } = useData();
  const [league, setLeague] = useState('nba'); //  State for selected league (NBA or NCAA) for comparison. Default to NBA.
  const [numComparisons, setNumComparisons] = useState(5); // State for the number of similar players to display. Default to top 5.

  // Use Memo to efficiently filter and select the list of players for comparison.
  const playersForComparison = useMemo(() => {
    const source = league === 'nba' ? nbaPlayers : ncaaPlayers; // Determine the source player list based on the selected league.
    const minGames = league === 'nba' ? MIN_GAMES_PLAYED_NBA : MIN_GAMES_PLAYED_NCAA; // Determine minimum games and minutes played based on the selected league from const.
    const minMinutes = league === 'nba' ? MIN_MINUTES_NBA : MIN_MINUTES_NCAA;
    return source.filter(p => p.Games >= minGames && p.Minutes >= minMinutes && p.PlayerID !== 'USER_PLAYER');
  }, [league, nbaPlayers, ncaaPlayers]); // Dependencies for memo.

  // Use Memo to calculate and rank similar players.
  const similarPlayers = useMemo(() => {
    if (!userData || !playersForComparison?.length) return []; // Return empty array, if no user data or no players to compare against.

    return playersForComparison // Map the filtered players to calculate a similarity score for each.
      .map(player => ({
        player, // The player object.
        similarityScore: calculateSimilarityScore(userData, player), // Calculated similarity score.
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort the players in descending order of their similarity score.
      .slice(0, numComparisons);
  }, [userData, playersForComparison, numComparisons]); // Dependencies for memo.

  if (loading && (!nbaPlayers?.length && !ncaaPlayers?.length)) return ( // Display loading spinner if data is loading and player lists are not yet populated.
    <div className="container"><LoadingSpinner message="Loading player data for comparisons..." /></div>
  );
  if (error) return <div className="container error-message">Error loading base player data: {error}</div>;

  
  if (!userData) { // Error handler - if user data is not detected, prompt  user to enter their stats.
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

      {/* Controls to selecting the league and number of results. */}
      <div className="controls card comparison-controls">
        <div className="control-group league-toggle">
          {/* Buttons for toggling between NBA and NCAA leagues. */}
          <button onClick={() => setLeague('nba')} className={`btn ${league === 'nba' ? 'active' : ''}`}>NBA</button>
          <button onClick={() => setLeague('ncaa')} className={`btn ${league === 'ncaa' ? 'active' : ''}`}>NCAA</button>
        </div>
        <div className="control-group num-results-selector">
          <label htmlFor="num-comparisons">Show Top: </label>
          {/* Dropdown to select the no. similar players to display. */}
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

      {/* Display the user's own profile summary for reference, if userData exists. */}
      {userData && (
        <div className="user-profile-summary card">
          <h3>Your Comparison Profile: {userData.Name}</h3>
          {/* PlayerCard will display the user stats. */}
          <PlayerCard player={userData} isUserPlayer={true} league="Your Input" />
        </div>
      )}

      {/* List of similar players. */}
      <div className="similar-players-list">
        <h2>Most Similar Players in {league.toUpperCase()}:</h2>
        {/* Show a loading message if calculations are in progress. */}
        {loading && similarPlayers.length === 0 && <LoadingSpinner message={`Calculating comparisons for ${league.toUpperCase()}...`} />}
        {!loading && similarPlayers.length > 0 ? (
          similarPlayers.map(({ player, similarityScore }, index) => (
            // Comparison items are accompanied by a PlayerCard and cumulative similarity score.
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