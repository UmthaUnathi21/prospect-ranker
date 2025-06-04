import React, { useState, useEffect, useMemo } from 'react'; // Import necessary React hooks and components.
import { useData } from '../contexts/DataContext'; // Import the data context to access player data and user-specific stats.
import PlayerCard from '../components/PlayerCard';// Import child components used for displaying player info and loading states.
import LoadingSpinner from '../components/LoadingSpinner';
import { // Import configuration constants for filtering criteria.
  MIN_GAMES_PLAYED_NBA,
  MIN_MINUTES_NBA,
  MIN_GAMES_PLAYED_NCAA,
  MIN_MINUTES_NCAA
} from '../config/constants';
import './RankingsPage.css';// Import the specific stylesheet for this component.

//An array of objects defining the statistics that the user can sort the player list by.
const STAT_KEYS_FOR_SORTING = [
    { value: "Points", label: "Points (PPG)" }, { value: "Rebounds", label: "Rebounds (RPG)" },
    { value: "Assists", label: "Assists (APG)" }, { value: "Steals", label: "Steals (SPG)" },
    { value: "BlockedShots", label: "Blocked Shots (BPG)" }, { value: "PlayerEfficiencyRating", label: "PER (Efficiency)"},
    { value: "FieldGoalsPercentage", label: "FG%" }, { value: "ThreePointersPercentage", label: "3P%" },
    { value: "FreeThrowsPercentage", label: "FT%" }, { value: "Minutes", label: "Minutes Per Game (MPG)"},
];

// Handler for state management, and league selection, sorting, filtering, and displaying player data.
const RankingsPage = () => {
  const { nbaPlayers, ncaaPlayers, userData, loading, error } = useData();
  const [league, setLeague] = useState('nba');
  const [sortBy, setSortBy] = useState('PlayerEfficiencyRating');
  const [sortedPlayersList, setSortedPlayersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const activeFilters = useMemo(() => {
    return league === 'nba' 
      ? { minGames: MIN_GAMES_PLAYED_NBA, minMinutes: MIN_MINUTES_NBA }
      : { minGames: MIN_GAMES_PLAYED_NCAA, minMinutes: MIN_MINUTES_NCAA };
  }, [league]);

  const playersToDisplay = useMemo(() => { // Selects the appropriate player data source based on the current league.
    const sourcePlayers = league === 'nba' ? nbaPlayers : ncaaPlayers;
    return sourcePlayers.filter(p =>  // Filters the players based on minimum games, minutes, and inputted search term.
        p.Games >= activeFilters.minGames && 
        p.Minutes >= activeFilters.minMinutes &&
        (p.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.Team?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [league, nbaPlayers, ncaaPlayers, activeFilters, searchTerm]);


useEffect(() => {
    let allPlayersForRanking = [...playersToDisplay]; // Used to create a copy of the players to avoid directly mutating the memo'd list.
    let userPlayerInList = null;

    if (userData && userData.Points !== undefined) { // Check if user data exists and has points, indicating it's valid to be displayed.
      const userPlayerFormatted = { // Used to format the user's data into a player object consistent with the API data structure.
        ...userData,
        PlayerID: 'USER_PLAYER', // A unique ID to identify the user's player object.
        Name: userData.Name || 'Your Player',
        Team: 'USER',
        // Filling in default values of 0 for any missing stats.
        Points: userData.Points || 0, Rebounds: userData.Rebounds || 0, Assists: userData.Assists || 0,
        Steals: userData.Steals || 0, BlockedShots: userData.BlockedShots || 0,
        PlayerEfficiencyRating: userData.PlayerEfficiencyRating || 0,
        FieldGoalsPercentage: userData.FieldGoalsPercentage || 0,
        ThreePointersPercentage: userData.ThreePointersPercentage || 0,
        FreeThrowsPercentage: userData.FreeThrowsPercentage || 0,
        Minutes: userData.Minutes || 0,
        Games: userData.Games || 1, // Assume at least 1 game to avoid division by 0.
        League: league.toUpperCase()
      };
      
      if (!searchTerm || userPlayerFormatted.Name?.toLowerCase().includes(searchTerm.toLowerCase())) { // If no active search detected or the user's player matches the search, add them to the list.
          allPlayersForRanking = [userPlayerFormatted, ...allPlayersForRanking.filter(p => p.PlayerID !== 'USER_PLAYER')]; // Place the user's player to the list for ranking.
          userPlayerInList = userPlayerFormatted;
      }
    }

    // Sort the combined list of players (including the user's, if applicable).
    const sorted = [...allPlayersForRanking].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Special case for 'Minutes' because we need to calculate Minutes Per Game (MPG) for sorting.
      if (sortBy === 'Minutes') {
        valA = a.Games > 0 ? (a.Minutes / a.Games) : 0;
        valB = b.Games > 0 ? (b.Minutes / b.Games) : 0;
      }

      // This treats any non-numeric or nullish values as -Infinity to push them to the bottom of the list.
      valA = (valA === undefined || valA === null || isNaN(parseFloat(valA))) ? -Infinity : parseFloat(valA);
      valB = (valB === undefined || valB === null || isNaN(parseFloat(valB))) ? -Infinity : parseFloat(valB);

      return valB - valA; // Perform a descending sort so that higher value is better.
    });

    setSortedPlayersList(sorted);  // Update state with newly sorted list, and trigger a re-render.

  }, [playersToDisplay, userData, sortBy, league, searchTerm]); // Dependencies to trigger this effect.


  // Conditional rendering - Show a loading spinner if data is loading and list is empty.
  if (loading && sortedPlayersList.length === 0) return (
    <div className="container"> <LoadingSpinner message={`Loading ${league.toUpperCase()} player rankings...`} /></div>
  );
  // Error handler - Show an error message if the data fetching failed.
  if (error) return <div className="container error-message">Error loading rankings: {error}</div>;

  const userPlayerFromSortedList = sortedPlayersList.find(p => p.PlayerID === 'USER_PLAYER'); // Find the user's player object from the final sorted list to determine their rank.
  const userRank = userPlayerFromSortedList ? sortedPlayersList.indexOf(userPlayerFromSortedList) + 1 : null; // Calculate the user's rank. Null if the user is not in the list.

  return (
    <div className="rankings-page container">
      <h1 className="page-title">{league.toUpperCase()} Player Rankings</h1>
      <div className="controls card">
        <div className="control-group league-toggle">
          <button onClick={() => { setLeague('nba'); setSearchTerm('');}} className={`btn ${league === 'nba' ? 'active' : ''}`}>NBA</button>
          <button onClick={() => { setLeague('ncaa'); setSearchTerm('');}} className={`btn ${league === 'ncaa' ? 'active' : ''}`}>NCAA</button>
        </div>
        <div className="control-group sort-options">
          <label htmlFor="sort-by">Sort by: </label>
          <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {STAT_KEYS_FOR_SORTING.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="control-group search-filter">
          <label htmlFor="search-term">Search Player/Team: </label>
          <input 
            type="text" 
            id="search-term" 
            placeholder="Name or Team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {userPlayerFromSortedList && userRank && (
        <div className="user-rank-summary sticky-user-rank card">
            <h2 className="user-rank-title">Your Rank: #{userRank} <span className="in-league">in {league.toUpperCase()}</span></h2>
            <p className="sorted-by-stat">Sorted by: {STAT_KEYS_FOR_SORTING.find(s => s.value === sortBy)?.label || sortBy}</p>
            <PlayerCard player={userPlayerFromSortedList} isUserPlayer={true} rank={userRank} league={league.toUpperCase()} />
        </div>
      )}

      {loading && sortedPlayersList.length === 0 && <LoadingSpinner message={`Filtering ${league.toUpperCase()} players...`} />}

      <div className="player-list">
        {sortedPlayersList.length > 0 ? (
          sortedPlayersList.map((player, index) => (
            (player.PlayerID === 'USER_PLAYER' && userPlayerFromSortedList && searchTerm === '') ? null :
            <PlayerCard
              key={player.PlayerID || `${player.Name}-${index}-${player.Team}`}
              player={player}
              rank={index + 1}
              isUserPlayer={player.PlayerID === 'USER_PLAYER'}
              league={player.League || league.toUpperCase()}
            />
          ))
        ) : (
          !loading && <p className="no-results">No players match the current filters or search term for {league.toUpperCase()}. Try adjusting filters or search.</p>
        )}
      </div>
    </div>
  );
};

export default RankingsPage;