// src/config/socket.js
const getSocketCorsOrigins = () => {
  if (process.env.SOCKET_CORS_ORIGIN) {
    return process.env.SOCKET_CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  // Fallback to CORS_ORIGIN if SOCKET_CORS_ORIGIN not set
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  // Mặc định cho development
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:8080',
    'https://localhost:5173',
    'https://localhost:3000'
  ];
};

export const SOCKET_CONFIG = {
  cors: {
    origin: getSocketCorsOrigins(),
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
};