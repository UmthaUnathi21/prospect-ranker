export const STAT_FIELDS_CONFIG = [
    //per-game stats
  { name: "Points", label: "Points Per Game (PPG)", type: "number", validation: { required: true, min: 0, max: 70 } },
  { name: "Rebounds", label: "Rebounds Per Game (RPG)", type: "number", validation: { required: true, min: 0, max: 30 } },
  { name: "Assists", label: "Assists Per Game (APG)", type: "number", validation: { required: true, min: 0, max: 20 } },
  { name: "Steals", label: "Steals Per Game (SPG)", type: "number", validation: { required: true, min: 0, max: 10 } },
  { name: "BlockedShots", label: "Blocks Per Game (BPG)", type: "number", validation: { required: true, min: 0, max: 10 } },
  { name: "Turnovers", label: "Turnovers Per Game (TPG)", type: "number", validation: { required: true, min: 0, max: 10 } },
  { name: "FieldGoalsMade", label: "Field Goals Made (FGM)", type: "number", validation: { min: 0, max: 30 } },
  { name: "FieldGoalsAttempted", label: "Field Goals Attempted (FGA)", type: "number", validation: { min: 0, max: 50 } },
  { name: "ThreePointersMade", label: "3-Pointers Made (3PM)", type: "number", validation: { min: 0, max: 15 } },
  { name: "ThreePointersAttempted", label: "3-Pointers Attempted (3PA)", type: "number", validation: { min: 0, max: 25 } },
  { name: "FreeThrowsMade", label: "Free Throws Made (FTM)", type: "number", validation: { min: 0, max: 25 } },
  { name: "FreeThrowsAttempted", label: "Free Throws Attempted (FTA)", type: "number", validation: { min: 0, max: 30 } },
  { name: "FieldGoalsPercentage", label: "Field Goal % (FG%)", type: "number", placeholder: "e.g., 45.5 (0-100)", validation: { min: 0, max: 100 }, isPercentage: true },
  { name: "ThreePointersPercentage", label: "3-Point % (3P%)", type: "number", placeholder: "e.g., 33.3 (0-100)", validation: { min: 0, max: 100 }, isPercentage: true },
  { name: "FreeThrowsPercentage", label: "Free Throw % (FT%)", type: "number", placeholder: "e.g., 75.0 (0-100)", validation: { min: 0, max: 100 }, isPercentage: true },
  { name: "Age", label: "Your Age", type: "number", validation: { required: true, min: 12, max: 45 } },
  {
    name: "CompetitionLevel",
    label: "Current Competition Level",
    type: "select",
    options: [
      { value: "", label: "Select Level" }, { value: "recreational", label: "Recreational League" },
      { value: "high_school_jv", label: "High School JV" }, { value: "high_school_varsity", label: "High School Varsity (Average)" },
      { value: "high_school_varsity_elite", label: "High School Varsity (Elite/Top AAU)" },
      { value: "college_club", label: "College Club Ball / JUCO (Lower Tier)"},
      { value: "college_juco_elite", label: "JUCO (Elite D1 Caliber)"},
      { value: "college_d3", label: "NCAA Division 3" }, { value: "college_d2", label: "NCAA Division 2" },
      { value: "college_d1_low", label: "NCAA Division 1 (Low-Major)" }, { value: "college_d1_mid", label: "NCAA Division 1 (Mid-Major)" },
      { value: "college_d1_high", label: "NCAA Division 1 (High-Major/Power 5)" },
      { value: "pro_overseas_low", label: "Professional (Overseas - Lower Tier)" }, { value: "pro_overseas_mid", label: "Professional (Overseas - Mid Tier)" },
      { value: "pro_overseas_high", label: "Professional (Overseas - Top Tier/EuroLeague)" },
      { value: "nba_g_league", label: "NBA G-League" }, { value: "nba_prospect", label: "NBA Prospect (Not yet drafted but on radar)"}
    ],
    validation: { required: true }
  },
];