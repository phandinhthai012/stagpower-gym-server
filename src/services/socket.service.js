// src/services/socket.service.js
let io;

class SocketService {
  setSocketIO(socketIO) {
    io = socketIO;
  }
  getSocketIO() {
    return io;
  }
  // gửi tin nhắn user cụ thể (có thể là admin, staff, PT, hội viên)
  emitToUser(userId, event, data) {
    if (io) {
      io.to(`user-${userId}`).emit(event, data);
    }
  }
  // gửi tin nhắn tới tất cả user trong room
  emitToRoom(room, event, data) {
    if (io) {
      io.to(room).emit(event, data);
    }
  }
  // gửi tin nhắn tới tất cả user
  emitToAll(event, data) {
    if (io) {
      io.emit(event, data);
    }
  }
  emitToBranch(branchId, event, data) {
    if (!io) return;
    io.to(`branch-${branchId}`).emit(event, data);
    console.log(`🏢 Emit to branch-${branchId}: ${event}`);
  }
}

export default new SocketService();