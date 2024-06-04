// in routes/stuff.js
const express = require('express');
const router = express.Router();
const libraryCtrl = require('../controllers/library');
const auth = require('../middleware/auth')

router.get('/', auth, libraryCtrl.getAllLibrary);
router.post('/', auth, libraryCtrl.createBook);
router.get('/:id', auth,libraryCtrl.getOneBook);
router.put('/:id', auth, libraryCtrl.modifyBook);
router.delete('/:id', auth, libraryCtrl.deleteBook);


module.exports = router;

