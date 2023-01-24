const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const boardRouter = require('./router/boardRouter');
const userRouter = require('./router/userRouter');
const postRouter = require('./router/postRouter');
const loginRouter = require('./router/loginRouter');
const commentRouter = require('./router/commentRouter');
const tagRouter = require('./router/tagRouter');

const app = express();

app.use(
    session({
        secret: 'victoria secret',
        resave: false,
        saveUninitialized: true,
        store: new MemoryStore({
            checkPeriod: 3600
        }),
        cookie: {maxAge: 3600}
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res,next)=>{
    console.log('lobby');
});

app.use(loginRouter);
app.use('/users',userRouter);
app.use('/boards', boardRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/tags', tagRouter);

module.exports = app;