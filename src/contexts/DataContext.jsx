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

  // Using useEffect hook to fetch initial data when the DataProvider is first mounted.
  useEffect(() => {
    const loadData = async () => { // Defines an async function to handle the data-fetching process.
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.allSettled([ // Using Promise.allSettled to fetch both NBA and NCAA data at the same time. Affords app functionality even with partial data.
          fetchNbaData(),
          fetchNcaaData()
        ]);

        if (results[0].status === 'fulfilled') { // Processing the result of the NBA data fetch.
          setNbaPlayers(results[0].value || []);
        } else {
          console.error("NBA Data fetch failed:", results[0].reason); // If failed, log the error for debugging.
          setError(prev => prev ? `${prev}, NBA data error` : 'Error fetching NBA player data.');
          setNbaPlayers([]);
        }

        if (results[1].status === 'fulfilled') { // Processing the result of the NCAA data fetch.
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

  const updateUserData = (data) => { //A function to update the user custom data.
    setUserData(data);
  };

  // Defining the 'value' object to be passed. Makes the state/s and functions available to components.
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