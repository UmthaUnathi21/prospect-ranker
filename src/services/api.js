// src/services/api.js

const NBA_API_KEY = '4e4f923807ca47389c7a734f68409eaa';
const NCAA_API_KEY = '72b7938d163a469d92609bd1bcbbab8e';

// These are the *specific endpoints* for the archive data you're using.
// The proxy will handle prepending the necessary /v3/nba/stats/json or /v3/cbb/stats/json parts.
const NBA_API_SPECIFIC_PATH = '/playerseasonstats/2024reg/2023-12-08-23-47.json';
const NCAA_API_SPECIFIC_PATH = '/playerseasonstats/2024reg/2024-03-17-16-00.json';

export const fetchNbaData = async () => {
  const urlWithKey = `/api/nba${NBA_API_SPECIFIC_PATH}?key=${NBA_API_KEY}`;
  console.log("Fetching NBA data via Vite proxy:", urlWithKey);
  try {
    const response = await fetch(urlWithKey);
    const responseText = await response.clone().text();
    console.log("Raw NBA API (proxied) response status:", response.status);
    // console.log("Raw NBA API (proxied) response text:", responseText); // Keep for debugging if needed

    if (!response.ok) {
      console.error(`HTTP error fetching NBA data! Status: ${response.status}, Response: ${responseText}`);
      throw new Error(`HTTP error fetching NBA data! Status: ${response.status}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
      console.error("NBA response was not JSON. Content-Type:", contentType, "Body:", responseText);
      throw new Error("Received non-JSON response from NBA API");
    }

    const data = JSON.parse(responseText); // Use the text we already fetched
    // const data = await response.json(); // Original way
    console.log("Successfully fetched NBA Data via proxy (first 2):", data.slice(0, 2));
    return data.map(p => ({ ...p, League: 'NBA' }));
  } catch (error) {
    console.error("Error in fetchNbaData (proxy):", error);
    throw error;
  }
};

export const fetchNcaaData = async () => {
  const urlWithKey = `/api/ncaa${NCAA_API_SPECIFIC_PATH}?key=${NCAA_API_KEY}`;
  console.log("Fetching NCAA data via Vite proxy:", urlWithKey);
  try {
    const response = await fetch(urlWithKey);
    const responseText = await response.clone().text();
    console.log("Raw NCAA API (proxied) response status:", response.status);
    // console.log("Raw NCAA API (proxied) response text:", responseText); // Keep for debugging if needed

    if (!response.ok) {
      console.error(`HTTP error fetching NCAA data! Status: ${response.status}, Response: ${responseText}`);
      throw new Error(`HTTP error fetching NCAA data! Status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
      console.error("NCAA response was not JSON. Content-Type:", contentType, "Body:", responseText);
      throw new Error("Received non-JSON response from NCAA API");
    }
    
    const data = JSON.parse(responseText); // Use the text we already fetched
    // const data = await response.json(); // Original way
    console.log("Successfully fetched NCAA Data via proxy (first 2):", data.slice(0, 2));
    return data.map(p => ({ ...p, League: 'NCAA' }));
  } catch (error) {
    console.error("Error in fetchNcaaData (proxy):", error);
    throw error;
  }
};