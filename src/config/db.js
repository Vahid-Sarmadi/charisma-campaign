const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to MongoDB using Mongoose.
 * The connection string is taken from process.env.DB_URI.
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URI, {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
}

module.exports = connectDB;
