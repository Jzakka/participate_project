const request = require('supertest');
const assert = require('assert');
const should = require('should');

const association = require('../../models/association/association');
const sequelize = require('../../database/in-memory');
const app = require('../../app');

let userId1, userId2, boardId, postId1, postId2;

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
        })
        .then(({ body }) => {
            userId1 = body.UserId;
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
        })
        .then(({ body }) => {
            userId2 = body.UserId;
        });
    await request(app)
        .post('/boards')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            boardName: 'NewBoard'
        })
        .then(({ body }) => {
            boardId = body.BoardId;
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
        })
        .then(({ body }) => {
            postId1 = body.PostId;
        });
    await request(app)
        .post('/posts')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            tags: ['test', 'tags', 'forTest'],
            title: 'TestPost2',
            userId: 1,
            boardId: 1,
            context: 'Anything ...',
        })
        .then(({ body }) => {
            postId2 = body.PostId;
        });
});

describe('ArticleTest', () => {
    test('getArticles-not-login', async () => {
        await request(app)
            .get('/articles')
            .expect(200)
            .then(({ body }) => {
                body.should.have.properties(['status', 'totalResults', 'articles']);
            });
    });
    test('getArticles-login', async () => {
        const agent = request.agent(app);
        await agent
            .post('/login')
            .send({
                email:'test@test.com',
                password: '1234'
            });
        await agent
            .post('/tags')
            .send({
                userId: userId1,
                tagName: 'bitcoin'
            });
        await agent
            .post('/tags')
            .send({
                userId: userId1,
                tagName: 'america'
            });
        await agent
            .post('/tags')
            .send({
                userId: userId1,
                tagName: 'space'
            });
        await agent
            .get('/articles')
            .expect(200)
            .then(({ body }) => {
                console.log(body);
                body.should.have.properties(['status', 'totalResults', 'articles']);
            });
    });
});