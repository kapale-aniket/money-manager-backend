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

// Start server regardless of MongoDB connection status
const PORT = process.env.PORT || 5000

// Connect to MongoDB (non-blocking)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB')
  })
  .catch((error) => {
    console.error('✗ MongoDB connection error:', error.message)
    console.log('Server will continue without MongoDB connection')
  })

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
