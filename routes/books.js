const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');
const multer = require('../middleware/multer');

const booksCtrl = require('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRating);
router.get('/:id', booksCtrl.getOneBook);
router.post('/', auth, multer, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.addRating);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);


module.exports = router;