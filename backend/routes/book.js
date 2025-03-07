const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { upload, optimizeImage } = require ('../middleware/multer-config');

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.bestRatings);
router.post('/', auth, upload.single('image'), optimizeImage, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.put('/:id', auth, upload.single('image'), optimizeImage, bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;