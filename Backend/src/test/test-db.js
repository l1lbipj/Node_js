
const path = require('path');
const connectDB = require('../configs/database.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testConnection = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');

    // 1. Kết nối MongoDB
    await connectDB();

    console.log('Database connection test: SUCCESS');

    // 2. Kiểm tra Replica Set
    const result = await mongoose.connection.db.admin().command({
      hello: 1
    });

    console.log('\n--- Replica Set Information ---');

    if (result.setName) {
      console.log('Replica Set: SUPPORTED');
      console.log(`Set Name: ${result.setName}`);
    } else {
      console.log('Replica Set: NOT DETECTED');
    }

    // 3. Kiểm tra khả năng hỗ trợ Transaction
    if (result.setName || result.msg === 'isdbgrid') {
      console.log('MongoDB Transaction: TOPOLOGY SUPPORTED');
    } else {
      console.log('MongoDB Transaction: TOPOLOGY NOT SUPPORTED');
    }

  } catch (error) {
    console.error('Database connection test: FAILED');
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB connection closed.');
  }
};

testConnection();
