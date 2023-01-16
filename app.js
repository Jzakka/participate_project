const bodyParser = require('body-parser');
const express = require('express');
const boardRouter = require('./router/boardRouter');
const userRouter = require('./router/userRouter');
const postRouter = require('./router/postRouter');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users',userRouter);
app.use('/boards', boardRouter);
app.use('/posts', postRouter);

module.exports = app;