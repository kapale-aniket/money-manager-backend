const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Transaction = require('../models/Transaction')
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns')

// Get all transactions with filters
router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not available',
        error: 'Please check MongoDB connection'
      })
    }

    const { category, division, startDate, endDate, viewType } = req.query
    
    let query = {}
    let dateFilter = {}

    // Apply date filter based on view type
    const now = new Date()
    if (viewType === 'weekly') {
      dateFilter = {
        $gte: startOfWeek(now),
        $lte: endOfWeek(now)
      }
    } else if (viewType === 'yearly') {
      dateFilter = {
        $gte: startOfYear(now),
        $lte: endOfYear(now)
      }
    } else {
      // monthly (default)
      dateFilter = {
        $gte: startOfMonth(now),
        $lte: endOfMonth(now)
      }
    }

    // Override with custom date range if provided
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } else if (startDate) {
      dateFilter = {
        $gte: new Date(startDate)
      }
    } else if (endDate) {
      dateFilter = {
        $lte: new Date(endDate)
      }
    }

    query.date = dateFilter

    if (category) {
      query.category = category
    }

    if (division) {
      query.division = division
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(1000)

    res.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Get summary (income, expense, balance)
router.get('/summary', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not available',
        error: 'Please check MongoDB connection'
      })
    }

    const { category, division, startDate, endDate, viewType } = req.query
    
    let query = {}
    let dateFilter = {}

    // Apply date filter based on view type
    const now = new Date()
    if (viewType === 'weekly') {
      dateFilter = {
        $gte: startOfWeek(now),
        $lte: endOfWeek(now)
      }
    } else if (viewType === 'yearly') {
      dateFilter = {
        $gte: startOfYear(now),
        $lte: endOfYear(now)
      }
    } else {
      // monthly (default)
      dateFilter = {
        $gte: startOfMonth(now),
        $lte: endOfMonth(now)
      }
    }

    // Override with custom date range if provided
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } else if (startDate) {
      dateFilter = {
        $gte: new Date(startDate)
      }
    } else if (endDate) {
      dateFilter = {
        $lte: new Date(endDate)
      }
    }

    query.date = dateFilter

    if (category) {
      query.category = category
    }

    if (division) {
      query.division = division
    }

    const transactions = await Transaction.find(query)

    const summary = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount
      } else {
        acc.expense += transaction.amount
      }
      return acc
    }, { income: 0, expense: 0 })

    summary.balance = summary.income - summary.expense

    res.json(summary)
  } catch (error) {
    console.error('Error fetching summary:', error)
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Create a new transaction
router.post('/', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not available',
        error: 'Please check MongoDB connection'
      })
    }

    const transaction = new Transaction(req.body)
    await transaction.save()
    res.status(201).json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    res.status(400).json({ 
      message: error.message || 'Bad request',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Update a transaction (only within 12 hours)
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    // Check if transaction is within 12 hours
    const now = new Date()
    const transactionDate = new Date(transaction.createdAt)
    const hoursDiff = (now - transactionDate) / (1000 * 60 * 60)

    if (hoursDiff > 12) {
      return res.status(403).json({ message: 'Cannot edit transaction after 12 hours' })
    }

    Object.assign(transaction, req.body)
    await transaction.save()

    res.json(transaction)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id)
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
