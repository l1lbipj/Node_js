
const path = require('path');
const connectDB = require('../configs/database.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testConnection = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');

    await connectDB();

    console.log('Database connection test: SUCCESS');

  } catch (error) {
    console.error('Database connection test: FAILED');
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

testConnection();
