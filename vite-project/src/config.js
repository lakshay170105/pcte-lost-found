// Always use VITE_API_URL — set in Vercel env vars
// Dev: set in .env.development
// Prod: set in Vercel dashboard
const API_URL = import.meta.env.VITE_API_URL || 'https://pcte-lost-found.onrender.com';

export default API_URL;
