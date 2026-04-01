import { io } from 'socket.io-client';

// In dev: empty string = Vite proxy handles it (no CORS)
// In production: VITE_API_URL = your Render backend URL
const URL = import.meta.env.VITE_API_URL || '';

const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'], // websocket first for real-time
});

export default socket;
