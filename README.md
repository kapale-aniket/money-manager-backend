# Money Manager Backend

Backend API for the Money Manager application built with Node.js, Express, and MongoDB.

## Features

- RESTful API for transaction management
- MongoDB integration with Mongoose
- Filtering by category, division, and date range
- 12-hour edit restriction
- Support for account-to-account transfers

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
```

3. Install date-fns (if not already installed):
```bash
npm install date-fns
```

4. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/summary` - Get income/expense summary
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction (within 12 hours)
- `DELETE /api/transactions/:id` - Delete a transaction

### Categories
- `GET /api/categories` - Get available categories

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- date-fns
