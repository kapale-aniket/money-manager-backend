const express = require('express')
const router = express.Router()

// Get available categories
router.get('/', (req, res) => {
  const categories = [
    'fuel',
    'food',
    'medical',
    'shopping',
    'entertainment',
    'bills',
    'salary',
    'other'
  ]
  res.json(categories)
})

module.exports = router
