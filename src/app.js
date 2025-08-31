import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database.js';
// Load environment variables
dotenv.config();



const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 5000 ;

(async () => {
  await connectDB();

  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('server is running..');
  });
  
  app.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
  });
})();

