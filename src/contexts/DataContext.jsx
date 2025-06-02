import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchNbaData, fetchNcaaData } from '../services/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [nbaPlayers, setNbaPlayers] = useState([]);
  const [ncaaPlayers, setNcaaPlayers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.allSettled([
          fetchNbaData(),
          fetchNcaaData()
        ]);

        if (results[0].status === 'fulfilled') {
          setNbaPlayers(results[0].value || []);
        } else {
          console.error("NBA Data fetch failed:", results[0].reason);
          setError(prev => prev ? `${prev}, NBA data error` : 'Error fetching NBA player data.');
          setNbaPlayers([]);
        }

        if (results[1].status === 'fulfilled') {
          setNcaaPlayers(results[1].value || []);
        } else {
          console.error("NCAA Data fetch failed:", results[1].reason);
          setError(prev => prev ? `${prev}, NCAA data error` : 'Error fetching NCAA player data.');
          setNcaaPlayers([]);
        }

      } catch (err) {
        console.error("Error in DataProvider loadData:", err);
        setError(err.message || 'Failed to load player data.');
        setNbaPlayers([]);
        setNcaaPlayers([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateUserData = (data) => {
    setUserData(data);
  };

  const value = {
    nbaPlayers,
    ncaaPlayers,
    userData,
    setUserData: updateUserData,
    loading,
    error,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};