import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import PlayerCard from '../components/PlayerCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MIN_GAMES_PLAYED_NBA,
  MIN_MINUTES_NBA,
  MIN_GAMES_PLAYED_NCAA,
  MIN_MINUTES_NCAA
} from '../config/constants';
import './RankingsPage.css';

const STAT_KEYS_FOR_SORTING = [
    { value: "Points", label: "Points (PPG)" }, { value: "Rebounds", label: "Rebounds (RPG)" },
    { value: "Assists", label: "Assists (APG)" }, { value: "Steals", label: "Steals (SPG)" },
    { value: "BlockedShots", label: "Blocked Shots (BPG)" }, { value: "PlayerEfficiencyRating", label: "PER (Efficiency)"},
    { value: "FieldGoalsPercentage", label: "FG%" }, { value: "ThreePointersPercentage", label: "3P%" },
    { value: "FreeThrowsPercentage", label: "FT%" }, { value: "Minutes", label: "Minutes Per Game (MPG)"},
];

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

  const playersToDisplay = useMemo(() => {
    const sourcePlayers = league === 'nba' ? nbaPlayers : ncaaPlayers;
    return sourcePlayers.filter(p => 
        p.Games >= activeFilters.minGames && 
        p.Minutes >= activeFilters.minMinutes &&
        (p.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.Team?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [league, nbaPlayers, ncaaPlayers, activeFilters, searchTerm]);


  useEffect(() => {
    let allPlayersForRanking = [...playersToDisplay];
    let userPlayerInList = null;

    if (userData && userData.Points !== undefined) {
      const userPlayerFormatted = {
        ...userData,
        PlayerID: 'USER_PLAYER', Name: userData.Name || 'Your Player', Team: 'USER',
        Points: userData.Points || 0, Rebounds: userData.Rebounds || 0, Assists: userData.Assists || 0,
        Steals: userData.Steals || 0, BlockedShots: userData.BlockedShots || 0,
        PlayerEfficiencyRating: userData.PlayerEfficiencyRating || 0,
        FieldGoalsPercentage: userData.FieldGoalsPercentage || 0,
        ThreePointersPercentage: userData.ThreePointersPercentage || 0,
        FreeThrowsPercentage: userData.FreeThrowsPercentage || 0,
        Minutes: userData.Minutes || 0,
        Games: userData.Games || 1,
        League: league.toUpperCase()
      };
      if (!searchTerm || userPlayerFormatted.Name?.toLowerCase().includes(searchTerm.toLowerCase())) {
         allPlayersForRanking = [userPlayerFormatted, ...allPlayersForRanking.filter(p => p.PlayerID !== 'USER_PLAYER')];
         userPlayerInList = userPlayerFormatted;
      }
    }

    const sorted = [...allPlayersForRanking].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'Minutes') {
        valA = a.Games > 0 ? (a.Minutes / a.Games) : 0;
        valB = b.Games > 0 ? (b.Minutes / b.Games) : 0;
      }
      
      valA = (valA === undefined || valA === null || isNaN(parseFloat(valA))) ? -Infinity : parseFloat(valA);
      valB = (valB === undefined || valB === null || isNaN(parseFloat(valB))) ? -Infinity : parseFloat(valB);
      
      return valB - valA;
    });
    
    setSortedPlayersList(sorted);

  }, [playersToDisplay, userData, sortBy, league, searchTerm]);


  if (loading && sortedPlayersList.length === 0) return (
    <div className="container"> <LoadingSpinner message={`Loading ${league.toUpperCase()} player rankings...`} /></div>
  );
  if (error) return <div className="container error-message">Error loading rankings: {error}</div>;
  

  const userPlayerFromSortedList = sortedPlayersList.find(p => p.PlayerID === 'USER_PLAYER');
  const userRank = userPlayerFromSortedList ? sortedPlayersList.indexOf(userPlayerFromSortedList) + 1 : null;

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