const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // ─── Project rooms ───────────────────────────────────────────────────────

    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // ─── Hackathon rooms ─────────────────────────────────────────────────────

    socket.on('hackathon:join', (hackathonId) => {
      socket.join(`hackathon:${hackathonId}`);
    });

    socket.on('hackathon:leave', (hackathonId) => {
      socket.leave(`hackathon:${hackathonId}`);
    });

    // ─── Chat ────────────────────────────────────────────────────────────────

    socket.on('message:send', async ({ projectId, content, type = 'text', fileUrl = null, fileName = null }) => {
      try {
        const message = await Message.create({
          project: projectId,
          sender: socket.user._id,
          content,
          type,
          fileUrl,
          fileName,
        });

        await message.populate('sender', 'name avatar');

        // Emit to all in project room (including sender)
        io.to(`project:${projectId}`).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing ──────────────────────────────────────────────────────────────

    socket.on('typing:start', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('typing:start', {
        userId,
        userName: socket.user.name,
        avatar: socket.user.avatar,
      });
    });

    socket.on('typing:stop', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('typing:stop', { userId });
    });

    // ─── Online users ─────────────────────────────────────────────────────────

    socket.on('users:online', () => {
      socket.emit('users:online', Array.from(onlineUsers.keys()));
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user:offline', { userId });
    });
  });
};

module.exports = socketHandler;
