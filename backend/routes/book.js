const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBooks);
router.post('/', bookCtrl.createBook);
router.put('/:id', bookCtrl.updateBook);
router.delete('/:id', bookCtrl.deleteBook);

module.exports = router;