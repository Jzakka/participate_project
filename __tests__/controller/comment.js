const request = require('supertest');
const assert = require('assert');
const should = require('should');

const association = require('../../models/association/association');
const sequelize = require('../../database/in-memory');
const app = require('../../app');

beforeEach(async () => {
    await association();
    await sequelize
        .sync({ force: true })
        .catch(err => {
            console.log(err);
        });
    await request(app)
        .post('/users')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            email: 'test@test.com',
            username: 'testuser',
            password: '1234',
            confirmPassword: '1234'
        });
    await request(app)
        .post('/users')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            email: 'test2@test.com',
            username: 'testuser2',
            password: '1234',
            confirmPassword: '1234'
        });
    await request(app)
        .post('/boards')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            boardName: 'NewBoard'
        });
    await request(app)
        .post('/posts')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            tags: ['aaa', 'bbb', 'ccc'],
            title: 'TestPost1',
            userId: 1,
            boardId: 1,
            context: 'Anything ...',
        });
});

describe('CommentTest', () => {
    test('addComment-success-no-childComments', async () => {
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                postId: 1,
                userId: 1,
                context: 'This is comment'
            })
            .expect(201);
    });
    test('addComment-success-childComments', async () => {
        let commentId;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                postId: 1,
                userId: 1,
                context: 'This is comment'
            })
            .then(({ body }) => {
                // console.log(body);
                commentId = body.CommentId;
            });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                commentId: commentId,
                postId: 1,
                userId: 1,
                context: 'SubComments'
            })
            .expect(201);
    });
    test('getComments', async () => {
        let commentId1, commentId2;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                postId: 1,
                userId: 1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                commentId: commentId1,
                postId: 1,
                userId: 1,
                context: 'SubComments'
            });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                postId: 1,
                userId: 1,
                context: 'This is comment2'
            })
            .then(({ body }) => { commentId2 = body.CommentId; });;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                commentId: commentId2,
                postId: 1,
                userId: 1,
                context: 'SubComments2'
            });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                commentId: commentId2,
                postId: 1,
                userId: 1,
                context: 'SubComments3'
            });
        await request(app)
            .get('/comments?postId=1')
            .expect(200);
        await request(app)
            .get('/comments?commentId=' + commentId2)
            .expect(200)
            .then(({ body }) => {
                body.map(({context})=>context).should.containDeep(['SubComments2', 'SubComments3']);
            });
    });
    test('getComment', async ()=>{
        let commentId1;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                postId: 1,
                userId: 1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await request(app)
            .get('/comments/'+commentId1)
            .expect(200)
            .then(({body})=>{
                body.should.have.value('context', 'This is comment1');
            });
    });
    test('updateComments', async ()=>{
        let commentId1;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                postId: 1,
                userId: 1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await request(app)
            .put('/comments/'+commentId1)
            .send({
                context: 'Updated Comment'
            })
            .expect(200);
        await request(app)
            .get('/comments/'+commentId1)
            .expect(200)
            .then(({body})=>{
                body.should.have.value('context', 'Updated Comment');
            });
    });
    test('deleteComment', async ()=>{
        let commentId1;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                postId: 1,
                userId: 1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await request(app)
            .put('/comments/'+commentId1)
            .send({
                deleted: 'Y'
            })
            .expect(200);
        await request(app)
            .get('/comments/'+commentId1)
            .expect(200)
            .then(({body})=>{
                body.should.have.value('deleted', 'Y');
            });
    });
});