const express = require('express');
const {body} = require('express-validator');

const tagController = require('../controllers/tagController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.get('/', tagController.getTags);

router.post('/',isAuth,
    [body('tagName').trim().isLength({min:4})]
,tagController.addTag);

module.exports = router;