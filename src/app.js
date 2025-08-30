import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
// Load environment variables
dotenv.config();

const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 8017;


app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});

