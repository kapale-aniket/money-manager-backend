const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: function() {
      return !this.isTransfer
    }
  },
  division: {
    type: String,
    enum: ['office', 'personal'],
    required: true,
    default: 'personal'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isTransfer: {
    type: Boolean,
    default: false
  },
  transferTo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
transactionSchema.index({ date: -1 })
transactionSchema.index({ type: 1 })
transactionSchema.index({ category: 1 })
transactionSchema.index({ division: 1 })

module.exports = mongoose.model('Transaction', transactionSchema)
