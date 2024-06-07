const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

const booksCtrl = require('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.post('/', booksCtrl.createBook);
router.get('/:id', auth,booksCtrl.getOneBook);
router.put('/:id', auth, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);


module.exports = router;