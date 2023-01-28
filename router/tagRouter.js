const express = require('express');
const tagController = require('../controllers/tagController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.get('/', tagController.getTags);

router.post('/',isAuth, tagController.addTag);

module.exports = router;