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

describe('TagTest', () => {
    test('getTags', async () => {
        await request(app)
            .get('/tags?postId=' + postId1)
            .expect(200)
            .then(({ body }) => {
                body.should.containDeep(['aaa', 'bbb', 'ccc']);
            });
        await request(app)
            .get('/tags?postId=' + postId2)
            .expect(200)
            .then(({ body }) => {
                body.should.containDeep(['test', 'tags', 'forTest']);
            });
    });
    test('addTag', async ()=>{
        await request(app)
            .post('/tags')
            .send({
                tagName: 'newTag'
            })
            .expect(200);
    });
});