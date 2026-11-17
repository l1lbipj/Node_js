const express = require('express');
const router = express.Router();

const bookController = require('../controllers/book.Controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public Routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// Protected Routes
router.post(
    '/',
    authMiddleware,
    roleMiddleware('admin', 'publisher'),
    bookController.createBook
);

router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('admin', 'publisher'),
    bookController.updateBook
);

router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('admin', 'publisher'),
    bookController.deleteBook
);

module.exports = router;