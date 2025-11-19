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
  await connectDB();

  await verifyConnection();

  app.use(cors(corsOptions));
  //Logging middleware
  app.use(morgan('combined'));
  app.use(express.static(path.join(__dirname, "templates")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  // socket.io
  socketHandler(io);

  // init cron jobs
  initCronJobs();

  // routes
  app.get('/', (req, res) => {
    res.send('server is running..');
  });
  const API_PREFIX = '/api';
  app.use(API_PREFIX, generalApiRateLimiter, router);



  // error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  // app.listen(port, hostname, () => {
  //   console.log(`Server is running on http://${hostname}:${port}`);
  // });
  server.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO server is running`);
  });
})();

