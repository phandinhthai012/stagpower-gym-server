export const SOCKET_CONFIG = {
    // CORS Configuration
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3001',
        'http://localhost:8080',
        'https://localhost:5173',
        'https://localhost:3000'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
  
    // Transport Configuration
    transports: ['websocket', 'polling'],
  };


// import { Server } from 'socket.io';
// import socketHandler from '../socket/index.js'; // Import handler chính

// export function setupSocketIO(httpServer) {
//   const io = new Server(httpServer, {
//     cors: {
//       origin: [
//         'http://localhost:3000',
//         'http://localhost:5173',
//         '*'
//       ],
//       methods: ['GET', 'POST'],
//       credentials: true
//     },
//     transports: ['websocket', 'polling']
//   });
//   socketHandler(io);
//   return io;
// }