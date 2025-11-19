// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; //middleware bảo mật giúp bảo vệ ứng dụng Express khỏi các lỗ hổng bảo mật phổ biến bằng cách thiết lập các HTTP headers bảo mật.
import morgan from 'morgan'; //một middleware logging cho Express.js, được sử dụng để log tất cả các HTTP requests đến server. Nó giúp developers theo dõi và debug các request một cách dễ dàng.
import path from 'path';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import router from './routes/index.js';
import { initCronJobs } from './jobs/index.js';
import { verifyConnection } from './config/nodemailer.js';
import { generalApiRateLimiter } from './middleware/rateLimit.js';
import socketHandler from './socket/index.js';
import { SOCKET_CONFIG } from './config/socket.js';
import corsOptions from './config/cors.js';

// socket.io  
import { createServer } from 'http';
import { Server } from 'socket.io';



const app = express();
app.set('trust proxy', 1);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 5000;

// create server
const server = createServer(app);

const io = new Server(server, SOCKET_CONFIG);

(async () => {
  try {
    console.log('🚀 Starting server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Hostname: ${hostname}, Port: ${port}`);

    // Connect database với error handling
    try {
      await connectDB();
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      console.warn('⚠️  Server will continue to start, but database features may not work');
      // Không exit, để server vẫn start (có thể retry sau)
    }

    // Verify email connection (non-blocking)
    try {
      await verifyConnection();
    } catch (emailError) {
      console.warn('⚠️  Email verification failed (non-critical)');
    }

    // Setup middleware
    app.use(cors(corsOptions));
    app.use(morgan('combined'));
    app.use(express.static(path.join(__dirname, "templates")));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Socket.io
    socketHandler(io);

    // Cron jobs
    initCronJobs();

    // Routes
    app.get('/', (req, res) => {
      res.send('server is running..');
    });
    
    const API_PREFIX = '/api';
    app.use(API_PREFIX, generalApiRateLimiter, router);

    // Error handlers
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server với error handling
    server.listen(port, hostname, (error) => {
      if (error) {
        console.error('❌ Server failed to start:', error);
        process.exit(1);
      }
      console.log(`✅ Server is running on http://${hostname}:${port}`);
      console.log(`🔌 Socket.IO server is running`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
      }
      process.exit(1);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      console.log('⚠️  SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('⚠️  SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Không exit ngay, chỉ log
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
})();

