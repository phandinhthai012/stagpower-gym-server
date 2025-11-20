import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'stagpower-gym';


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DATABASE
    });
    console.log(`✅ MongoDB Connected Successfully to ${MONGODB_DATABASE}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    // Không exit ngay, throw error để caller handle
    // Server vẫn có thể start và retry connection sau
    throw error;
  }
};

export default connectDB;
