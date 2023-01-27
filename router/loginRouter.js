const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();

router.post('/login', loginController.postLogin);

// router.put('/logout', loginController.postLogout);

module.exports = router;