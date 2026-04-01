import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import lostItemRoutes from './routes/lostItems.js';
import foundItemRoutes from './routes/foundItems.js';
import feedbackRoutes from './routes/feedback.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import claimRoutes from './routes/claims.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

// Accept any vercel.app subdomain for this project
const isAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

// Socket.IO setup
export const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => cb(null, isAllowed(origin)),
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join user's personal notification room
  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} joined personal room`);
  });

  // Join a claim's private chat room (only participants)
  socket.on('join:claim', (claimId) => {
    socket.join(`claim:${claimId}`);
    console.log(`💬 Socket joined claim room: ${claimId}`);
  });

  socket.on('leave:claim', (claimId) => {
    socket.leave(`claim:${claimId}`);
  });

  // Typing indicator — relay to room
  socket.on('chat:typing', ({ claimId, userId }) => {
    socket.to(`claim:${claimId}`).emit('chat:typing', { claimId, userId });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => cb(null, isAllowed(origin)),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/claims', claimRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PCTE Lost & Found API is running',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount
  });
});

// Root route — show API info
app.get('/', (_req, res) => {
  res.json({
    name: 'PCTE Lost & Found API',
    version: '1.0.0',
    status: 'running',
    endpoints: '/api/health | /api/auth | /api/lost-items | /api/found-items | /api/claims | /api/admin',
    frontend: process.env.ALLOWED_ORIGINS || 'https://pcte-lost-found.vercel.app',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.use('*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔌 Socket.IO enabled for real-time sync`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Kill the process and retry.`);
    process.exit(1);
  }
});

// Graceful shutdown — prevents EADDRINUSE on nodemon restart
process.on('SIGTERM', () => { server.close(() => mongoose.disconnect()); });
process.on('SIGINT', () => { server.close(() => { mongoose.disconnect(); process.exit(0); }); });
