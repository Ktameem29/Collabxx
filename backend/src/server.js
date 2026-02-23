require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigin = (origin, callback) => {
  if (!origin) return callback(null, true); // allow non-browser requests
  if (
    origin === CLIENT_URL ||
    origin === 'http://localhost:5173' ||
    origin === 'http://localhost:3000' ||
    /\.vercel\.app$/.test(origin)
  ) {
    return callback(null, true);
  }
  callback(new Error('CORS: origin not allowed'));
};

// Socket.io
const io = new Server(server, {
  cors: { origin: allowedOrigin, methods: ['GET', 'POST'], credentials: true },
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// Connect DB
connectDB();

// Trust proxy (needed behind nginx/Docker so rate limit uses real client IP)
if (isProd) app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,  // required for Socket.io
  contentSecurityPolicy: false,      // configure per-project if needed
}));

// Response compression
app.use(compression());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts — try again later.' },
});

app.use('/api/', generalLimiter);

// Body parsing
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport (for Google OAuth)
app.use(passport.initialize());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/files', require('./routes/files'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/hackathons', require('./routes/hackathons'));
app.use('/api/merit', require('./routes/merit'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/seed', require('./routes/seed'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Collabxx', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// Socket handler
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Collabxx server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000); // force exit after 10s
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, server };
