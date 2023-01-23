const express = require('express');
const tagController = require('../controllers/tagController');

const router = express.Router();

router.get('/', tagController.getTags);

router.post('/', tagController.addTag);

module.exports = router;