// Dev: empty = Vite proxy to localhost:5001 (no CORS issues)
// Production: set VITE_API_URL=https://your-app.onrender.com in Vercel env vars
const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL;
