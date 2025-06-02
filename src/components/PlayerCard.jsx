import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, isUserPlayer, rank, league }) => {
  if (!player) return null;

  const keyStats = [
    { label: "PPG", value: player.Points?.toFixed(1) },
    { label: "RPG", value: player.Rebounds?.toFixed(1) },
    { label: "APG", value: player.Assists?.toFixed(1) },
    { label: "SPG", value: player.Steals?.toFixed(1) },
    { label: "BPG", value: player.BlockedShots?.toFixed(1) },
    { label: "FG%", value: player.FieldGoalsPercentage?.toFixed(1) },
    { label: "3P%", value: player.ThreePointersPercentage?.toFixed(1) },
    { label: "FT%", value: player.FreeThrowsPercentage?.toFixed(1) },
    { label: "PER", value: player.PlayerEfficiencyRating?.toFixed(1) },
  ].filter(stat => stat.value !== undefined && stat.value !== null && !isNaN(parseFloat(stat.value)));

  const playerName = player.Name || 'Unknown Player';
  const playerTeam = player.Team && player.Team !== "USER" ? `(${player.Team})` : (isUserPlayer ? '(Your Profile)' : '');

  return (
    <div className={`player-card-item ${isUserPlayer ? 'user-highlight' : ''}`}>
      <div className="player-card-header">
        {rank && <span className="player-rank">{rank}.</span>}
        <h3 className="player-name">{playerName}</h3>
        {playerTeam && <span className="player-team">{playerTeam}</span>}
        {isUserPlayer && <span className="user-tag">YOU</span>}
      </div>
      <div className="player-card-stats">
        {keyStats.slice(0, 6).map(stat => (
          <div key={stat.label} className="stat-item">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}{stat.label.includes('%') ? '%' : ''}</span>
          </div>
        ))}
      </div>
      <div className="player-card-footer">
        {player.Position && <p className="player-info">Pos: {player.Position}</p>}
        {player.Games !== undefined && player.Games > 0 && <p className="player-info">GP: {player.Games}</p>}
        {player.Minutes !== undefined && player.Minutes > 0 && <p className="player-info">Min: {(player.Minutes / (player.Games > 0 ? player.Games : 1)).toFixed(1)}</p>}
        {league && <p className="player-info league-tag">{league}</p>}
      </div>
    </div>
  );
};

export default PlayerCard;
