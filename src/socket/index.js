// src/socket/index.js
import socketAuth from './middleware/socketAuth.js';
import createSocketRateLimit from './middleware/socketRateLimit.js';
import roomManager from './rooms/roomManager.js';
import socketService from '../services/socket.service.js';
import userHandler from './handler/user.handler.js';
import checkInHandler from './handler/checkIn.handler.js';

const rateLimitMiddlewareFactory = createSocketRateLimit();

const onlineUsers = new Map();
const onlineMembers = new Map();

const getUserId = (socket) => socket.user?._id?.toString();

const ensureUserRecord = (socket) => {
  const userId = getUserId(socket);
  if (!userId) return null;

  const existingRecord = onlineUsers.get(userId);
  if (existingRecord) {
    existingRecord.sockets.add(socket.id);
    existingRecord.lastConnectedAt = new Date();
    return existingRecord;
  }

  const record = {
    userId,
    fullName: socket.user.fullName,
    role: socket.user.role,
    sockets: new Set([socket.id]),
    lastConnectedAt: new Date(),
  };
  onlineUsers.set(userId, record);
  return record;
};

const removeSocketFromRecords = (socket) => {
  const userId = getUserId(socket);
  if (!userId) return;

  const record = onlineUsers.get(userId);
  if (!record) return;

  record.sockets.delete(socket.id);
  if (record.sockets.size === 0) {
    onlineUsers.delete(userId);
    onlineMembers.delete(userId);
  }
};

const formatRecordForResponse = (record) => {
  const socketIds = Array.from(record.sockets);
  return {
    userId: record.userId,
    fullName: record.fullName,
    role: record.role,
    connectedAt: record.lastConnectedAt,
    socketId: socketIds[socketIds.length - 1],
    socketIds,
  };
};

const buildOnlineUsersSnapshot = () => {
  const users = Array.from(onlineUsers.values()).map(formatRecordForResponse);
  const members = Array.from(onlineMembers.values()).map(formatRecordForResponse);

  return {
    totalOnlineUsers: onlineUsers.size,
    totalOnlineMembers: onlineMembers.size,
    byRole: {
      admin: users.filter((u) => u.role === 'admin').length,
      staff: users.filter((u) => u.role === 'staff').length,
      trainer: users.filter((u) => u.role === 'trainer').length,
      member: users.filter((u) => u.role === 'member').length,
    },
    users,
    members,
  };
};

const emitOnlineUsersSnapshot = (targetSocket) => {
  const snapshot = buildOnlineUsersSnapshot();
  socketService.emitToRoom('admin-room', 'online-users-updated', snapshot);
  if (targetSocket) {
    targetSocket.emit('online-users-updated', snapshot);
  }
  return snapshot;
};

const socketHandler = (io) => {
  console.log('🔌 Initializing Socket.IO...');

  // Set socket.io instance for services
  socketService.setSocketIO(io);

  // Global middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    console.log(`👤 User: ${socket.user?.fullName} (${socket.user?.role})`);

    socket.use(rateLimitMiddlewareFactory(socket));

    if (socket.user) {
      const record = ensureUserRecord(socket);
      if (socket.user.role === 'member' && record) {
        onlineMembers.set(record.userId, record);
      }

      roomManager.joinUserRooms(socket);
      emitOnlineUsersSnapshot(socket);
    }



    userHandler(socket, buildOnlineUsersSnapshot);

    checkInHandler(socket, io);

    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`🚨 Socket error for ${socket.id}:`, error);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      if (socket.user) {
        removeSocketFromRecords(socket);
        emitOnlineUsersSnapshot();
      }
      if(socket.rateLimit) {
        socket.rateLimit.timestamps = [];
        socket.rateLimit.blockedUntil = null;
      }
    });
  });

  console.log('✅ Socket.IO initialized successfully');
  return io;
};

export default socketHandler;

