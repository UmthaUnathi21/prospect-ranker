import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy NBA requests
      '/api/nba': {
        target: 'http://archive.sportsdata.io', // The base URL of the NBA API
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api\/nba/, '/v3/nba/stats/json'), // Remove /api/nba and prepend the actual path
        // Example: /api/nba/playerseasonstats/2024reg/... becomes http://archive.sportsdata.io/v3/nba/stats/json/playerseasonstats/2024reg/...
      },
      // Proxy NCAA requests
      '/api/ncaa': {
        target: 'http://archive.sportsdata.io', // The base URL of the NCAA API
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ncaa/, '/v3/cbb/stats/json'), // Remove /api/ncaa and prepend the actual path
        // Example: /api/ncaa/playerseasonstats/2024reg/... becomes http://archive.sportsdata.io/v3/cbb/stats/json/playerseasonstats/2024reg/...
      },
    },
  },
});