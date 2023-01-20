const request = require('supertest');
const assert = require('assert');
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
            .expect(200);
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
            .then(({body})=>{
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
            .expect(200);
    })
});