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
    socket.join(`user:${userId}`); // personal room for targeted notifications
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

    socket.on('message:send', async ({ projectId, content, type = 'text', fileUrl = null, fileName = null, pollQuestion = null, pollOptions = null }) => {
      try {
        const msgData = { project: projectId, sender: socket.user._id, content, type, fileUrl, fileName };
        if (type === 'poll' && pollQuestion && pollOptions) {
          msgData.pollQuestion = pollQuestion;
          msgData.pollOptions = pollOptions.map((text) => ({ text, votes: [] }));
        }
        const message = await Message.create(msgData);
        await message.populate('sender', 'name avatar');
        io.to(`project:${projectId}`).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Polls ───────────────────────────────────────────────────────────────

    socket.on('poll:vote', async ({ messageId, optionIndex, projectId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.type !== 'poll') return;
        const uid = socket.user._id.toString();
        message.pollOptions.forEach((opt) => {
          opt.votes = opt.votes.filter((v) => v.toString() !== uid);
        });
        if (message.pollOptions[optionIndex]) message.pollOptions[optionIndex].votes.push(socket.user._id);
        await message.save();
        await message.populate('sender', 'name avatar');
        io.to(`project:${projectId}`).emit('poll:updated', message);
      } catch { /* ignore */ }
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
