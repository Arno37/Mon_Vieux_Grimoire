/* eslint-disable eol-last */
/* eslint-disable func-call-spacing */
/* eslint-disable no-spaced-func */
/* eslint-disable import/newline-after-import */
const express = require ('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/signup', userController.signup);
router.post('/login', userController.login);

module.exports = router;