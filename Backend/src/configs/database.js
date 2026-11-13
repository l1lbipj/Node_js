const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    throw new Error('MONGODB_URI is not set. Add it to Backend/.env before connecting.');
  }

  try {
    await mongoose.connect(uri);

    console.log(
      `MongoDB connected: ${mongoose.connection.host}`
    );
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;