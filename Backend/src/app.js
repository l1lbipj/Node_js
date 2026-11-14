
const express = require('express');
const requestLogger = require('./middlewares/requestLogger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const apiResponse = require('./utils/apiResponse');
const app = express();
const bookRoutes = require('./routes/book.routes');
const authRoutes = require('./routes/auth.routes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  return apiResponse.successResponse(res, 'Book Review & Publisher Portal API is running', null);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
