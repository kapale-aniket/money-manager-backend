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

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/money-manager'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
  })

module.exports = app
