const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const upload = require('../middleware/multer-config');


const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, upload.single('image'), bookCtrl.createBook);
router.put('/:id', auth, upload.single('image'), bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;