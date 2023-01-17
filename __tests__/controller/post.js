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
            password: '1234'
        })
        .then(res => {
            // console.log(res.body.id);
        });
    return await request(app)
        .post('/boards')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            boardName: 'NewBoard'
        })
        .then(res => {
            // console.log(res.body.id);
        });
});

//TODO: tag 와 함께 생성 조회를 하지 못하는 중
describe('PostTest', () => {
    test('addPost-success', async () => {
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                tags: ['aaa', 'bbb', 'ccc'],
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                context: 'Anything ...',
            })
            .expect(200)
            .then(({ body }) => {
                // console.log(body);
                assert.deepStrictEqual({
                    title: body.title,
                    userId: body.UserId,
                    boardId: body.BoardId,
                    context: body.context,
                    tags: body.Tags.map(tag => tag.tagName)
                }, {
                    title: 'TestPost',
                    userId: 1,
                    boardId: 1,
                    context: 'Anything ...',
                    tags: ['aaa', 'bbb', 'ccc']
                });
            });
    });

    test('addPost-twice', async () => {
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
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                tags: ['aaa', 'ccc'],
                title: 'TestPost2',
                userId: 1,
                boardId: 1,
                context: 'This is second post',
            })
            .expect(200)
            .then(({ body }) => {
                // console.log(body);
                assert.deepStrictEqual({
                    title: body.title,
                    userId: body.UserId,
                    boardId: body.BoardId,
                    context: body.context,
                    tags: body.Tags.map(tag => tag.tagName)
                }, {
                    title: 'TestPost2',
                    userId: 1,
                    boardId: 1,
                    context: 'This is second post',
                    tags: ['aaa', 'ccc']
                });
            });
    });

    test('addPost-fail', async () => {
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                boardId: 1,
                context: 'Anything ...',
            })
            .expect(400)
            .then(({ body }) => {
                assert.strictEqual(body.Error, 'Cannot feed post');
            })
    });

    test('getPosts', async () => {
        let postId1, postId2;
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.id;
            });
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost2',
                userId: 1,
                boardId: 1,
                maxParticipants: 5,
                context: 'Anything ......',
                tags: ['aaa', 'ttt', 'xx']
            })
            .then(({ body }) => {
                postId2 = body.id;
            });
        await request(app)
            .get('/posts?tag=aaa&tag=ccc')
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, [postId1]);
            });
        await request(app)
            .get('/posts?title=TestPost2')
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, [postId2]);
            });
    });

    test('getPost-success', async () => {
        let postId1;
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.id;
            });
        await request(app)
            .get('/posts/' + postId1)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual([
                    body.title,
                    body.UserId,
                    body.BoardId,
                    body.context,
                    body.Tags.map(element => element.tagName)
                ], ['TestPost', 1, 1, 'Anything ...', ['aaa', 'ccc']]);
            });
    });

    test('getPost-fail', async () => {
        await request(app)
            .get('/posts/' + 404)
            .expect(404);
    });

    test('updatePost-success', async () => {
        let postId1;
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.id;
            });
        await request(app)
            .put('/posts/' + postId1)
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'UpdatePost',
                context: 'The context was updated',
                tags: ['updated', 'tag']
            })
            .expect(200);
        await request(app)
            .get('/posts/' + postId1)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual([
                    body.title,
                    body.UserId,
                    body.BoardId,
                    body.context,
                    body.Tags.map(element => element.tagName)
                ], ['UpdatePost', 1, 1, 'The context was updated', ['updated', 'tag']]);
            });
    });

    test('updatePost-fail', async () => {
        await request(app)
            .put('/posts/' + 404)
            .set('Accept', 'application/json')
            .type('application/json')
            .expect(400)
            .send({
                title: 'UpdatePost',
                context: 'The context was updated',
                tags: ['updated', 'tag']
            })
            .then(({ body }) => {
                assert.strictEqual(body.Error, 'Cannot update post');
            });
    });
});
