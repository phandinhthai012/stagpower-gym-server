import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const socketAuth = async (socket, next) => {
  try {
    // Get token from handshake
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Invalid authentication token'));
  }
};

export default socketAuth;