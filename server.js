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

// Health check with MongoDB status
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    mongodb: mongoStatus,
    timestamp: new Date().toISOString()
  })
})

// Root route for Railway health check
app.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  res.json({ 
    status: 'OK', 
    message: 'Money Manager API is running',
    mongodb: mongoStatus,
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

// MongoDB connection options with retry logic
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
}

// Connect to MongoDB with retry logic
if (MONGODB_URI && !MONGODB_URI.includes('localhost')) {
  const connectWithRetry = () => {
    mongoose.connect(MONGODB_URI, mongooseOptions)
      .then(() => {
        console.log('✓ Connected to MongoDB Atlas successfully')
        console.log(`  Database: ${mongoose.connection.db?.databaseName || 'money-manager'}`)
      })
      .catch((error) => {
        console.error('✗ MongoDB connection error:', error.message)
        if (error.message.includes('IP') || error.message.includes('whitelist')) {
          console.error('  ⚠ IP Whitelist Issue Detected:')
          console.error('    1. Verify 0.0.0.0/0 is whitelisted in MongoDB Atlas')
          console.error('    2. Wait 2-3 minutes for changes to propagate')
          console.error('    3. Connection will retry automatically')
        }
        console.log('  Retrying connection in 5 seconds...')
        setTimeout(connectWithRetry, 5000)
      })
  }
  
  // Start connection attempt
  connectWithRetry()
  
  // Handle connection events
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message)
  })
  
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Will attempt to reconnect...')
  })
  
  mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB reconnected successfully')
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
