// src/socket/index.js
import socketAuth from './middleware/socketAuth.js';
import socketRateLimit from './middleware/socketRateLimit.js';
import roomManager from './rooms/roomManager.js';
import socketService from '../services/socket.service.js';
import userHandler from './handler/user.handler.js';
import checkInHandler from './handler/checkIn.handler.js';

let onlineUsers = new Map()
let onlineMembers = new Map()
const socketHandler = (io) => {
  console.log('🔌 Initializing Socket.IO...');

  // Set socket.io instance for services
  socketService.setSocketIO(io);

  // Global middleware
  io.use(socketAuth);
  io.use(socketRateLimit);

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    console.log(`👤 User: ${socket.user?.fullName} (${socket.user?.role})`);

    if (socket.user) {
      if (socket.user.role === 'member') {
        onlineMembers.set(socket.user._id.toString(), {
          socketId: socket.id,
          userId: socket.user._id,
          fullName: socket.user.fullName,
          role: socket.user.role,
          connectedAt: new Date()
        });
      }
      onlineUsers.set(socket.user._id.toString(), {
        socketId: socket.id,
        userId: socket.user._id,
        fullName: socket.user.fullName,
        role: socket.user.role,
        connectedAt: new Date()
      });

      socketService.emitToRoom('admin-room', 'online-users-updated', {
        totalOnlineUsers: onlineUsers.size,
        totalOnlineMembers: onlineMembers.size,
        byRole: {
          admin:  Array.from(onlineUsers.values()).filter(u => u.role === 'admin').length,
          staff: Array.from(onlineUsers.values()).filter(u => u.role === 'staff').length,
          trainer: Array.from(onlineUsers.values()).filter(u => u.role === 'trainer').length,
          member: Array.from(onlineUsers.values()).filter(u => u.role === 'member').length
        },
        users: Array.from(onlineUsers.values())
      });
    }



    // Join user to appropriate rooms
    roomManager.joinUserRooms(socket);

    userHandler(socket, io, onlineUsers, onlineMembers);

    checkInHandler(socket, io);

    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`🚨 Socket error for ${socket.id}:`, error);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      if (socket.user) {
        if (socket.user.role === 'member') {
          onlineMembers.delete(socket.user._id.toString());
        }
        onlineUsers.delete(socket.user._id.toString());
        socketService.emitToRoom('admin-room', 'online-users-updated', {
          totalOnlineUsers: onlineUsers.size,
          totalOnlineMembers: onlineMembers.size,
          byRole: {
            admin: Array.from(onlineUsers.values()).filter(u => u.role === 'admin').length,
            staff: Array.from(onlineUsers.values()).filter(u => u.role === 'staff').length,
            trainer: Array.from(onlineUsers.values()).filter(u => u.role === 'trainer').length,
            member: Array.from(onlineUsers.values()).filter(u => u.role === 'member').length
          },
          users: Array.from(onlineUsers.values()),
        });
      }
      if(socket.rateLimit) {
        socket.rateLimit.requests = [];
        socket.rateLimit.blocked = false;
      }
    });
  });

  console.log('✅ Socket.IO initialized successfully');
  return io;
};

export default socketHandler;

