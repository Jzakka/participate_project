const bodyParser = require('body-parser');
const express = require('express');
const boardRouter = require('./router/boardRouter');
const userRouter = require('./router/userRouter');
const postRouter = require('./router/postRouter');
const loginRouter = require('./router/loginRouter');
const commentRouter = require('./router/commentRouter');
const tagRouter = require('./router/tagRouter');
const articleController = require('./controllers/articleController');
const { allowUnAuth } = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    next();
});

app.get('/', (req, res, next) => {
    console.log('lobby');
});

app.use(loginRouter);
app.use('/users', userRouter);
app.use('/boards', boardRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/tags', tagRouter);
app.use('/articles', allowUnAuth, articleController.getArticles);

app.use((err, req, res, next) => {
    if (err) {
        console.log(err);
        const status = err.statusCode || 500;
        const message = err.message;
        const data = err.data;
        res.status(status).json({ message: message, data: data });
    }
});

module.exports = app;