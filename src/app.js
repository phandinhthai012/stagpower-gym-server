import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; //middleware bảo mật giúp bảo vệ ứng dụng Express khỏi các lỗ hổng bảo mật phổ biến bằng cách thiết lập các HTTP headers bảo mật.
import morgan from 'morgan'; //một middleware logging cho Express.js, được sử dụng để log tất cả các HTTP requests đến server. Nó giúp developers theo dõi và debug các request một cách dễ dàng.
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database.js';
// Load environment variables
dotenv.config();



const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 5000 ;

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
};

(async () => {
  await connectDB();


  app.use(cors(corsOptions));


  //Logging middleware
  app.use(morgan('combined'));

  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());


  app.get('/', (req, res) => {
    res.send('server is running..');
  });
  
  app.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
  });
})();

