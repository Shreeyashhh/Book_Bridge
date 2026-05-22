import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookbridge', {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of hanging
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Warning: MongoDB connection failed (${error.message}).`);
    console.error(`Backend is running, but database operations will fail. The frontend will fall back to Guest Sandbox Mode.`);
  }
};

export default connectDB;
