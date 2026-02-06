const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/transactions', require('./routes/transactions'))
app.use('/api/categories', require('./routes/categories'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Root route for Railway health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Money Manager API is running',
    timestamp: new Date().toISOString()
  })
})

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/money-manager'

// Log MongoDB URI status (without exposing password)
if (MONGODB_URI && MONGODB_URI.includes('mongodb+srv://')) {
  const uriParts = MONGODB_URI.split('@')
  if (uriParts.length > 1) {
    console.log('✓ MongoDB URI: Configured (Atlas)')
    console.log(`  Host: ${uriParts[1].split('/')[0]}`)
  } else {
    console.log('⚠ MongoDB URI: Configured but format may be incorrect')
  }
} else if (MONGODB_URI.includes('localhost')) {
  console.log('⚠ MongoDB URI: Using default localhost (MONGODB_URI not set in environment)')
} else {
  console.log('✓ MongoDB URI: Configured')
}

// Start server regardless of MongoDB connection status
const PORT = process.env.PORT || 5000

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
}

// Connect to MongoDB (non-blocking)
if (MONGODB_URI && !MONGODB_URI.includes('localhost')) {
  mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
      console.log('✓ Connected to MongoDB Atlas')
    })
    .catch((error) => {
      console.error('✗ MongoDB connection error:', error.message)
      console.error('  Connection string format:', MONGODB_URI.includes('mongodb+srv://') ? 'Correct (Atlas)' : 'Incorrect')
      console.log('Server will continue without MongoDB connection')
      console.log('Please check MONGODB_URI environment variable in Railway')
    })
} else {
  console.log('⚠ Skipping MongoDB connection (using localhost or not configured)')
  console.log('  Set MONGODB_URI environment variable in Railway to connect to MongoDB Atlas')
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server is running on port ${PORT}`)
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✓ MongoDB URI: ${MONGODB_URI ? 'Configured' : 'Not configured'}`)
})

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error)
})

module.exports = app
