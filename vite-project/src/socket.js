import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'https://pcte-lost-found.onrender.com';

const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'],
});

export default socket;
