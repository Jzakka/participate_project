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
            .expect(201);
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
            .expect(201);
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
                assert.deepStrictEqual(body, { message: 'Failed to create post' });
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
                postId1 = body.PostId;
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
                postId2 = body.PostId;
            });
        await request(app)
            .get('/posts?tag=aaa&tag=ccc')
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, [{ id: postId1, title: 'TestPost' }]);
            });
        await request(app)
            .get('/posts')
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, [{ id: postId1, title: 'TestPost' }, { id: postId2, title: 'TestPost2' }]);
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
                postId1 = body.PostId;
            });
        await request(app)
            .get('/posts/' + postId1)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual({
                    id: 1,
                    title: 'TestPost',
                    context: 'Anything ...',
                    dueDate: body.dueDate,
                    maxParticipants: 0,
                    createdAt: body.createdAt,
                    updatedAt: body.updatedAt,
                    UserId: 1,
                    BoardId: 1,
                    Tags: ['aaa', 'ccc']
                }, body);
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
                postId1 = body.PostId
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
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: "Update post successfull" });
            });
        await request(app)
            .get('/posts/' + postId1)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual({
                    id: 1,
                    title: 'UpdatePost',
                    context: 'The context was updated',
                    dueDate: body.dueDate,
                    maxParticipants: 0,
                    createdAt: body.createdAt,
                    updatedAt: body.updatedAt,
                    UserId: 1,
                    BoardId: 1,
                    Tags: ['updated', 'tag']
                }, body);
            });
    });

    test('updatePost-fail', async () => {
        await request(app)
            .put('/posts/' + 404)
            .set('Accept', 'application/json')
            .type('application/json')
            .expect(400)
            .send({
                title: 'UpdatedPost',
                context: 'The context was updated',
                tags: ['updated', 'tag']
            })
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'Failed to update post' });
            });
    });

    test('deletePost-success', async () => {
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
                postId1 = body.PostId;
            });
        await request(app)
            .delete('/posts/' + postId1)
            .expect(200)
            .then(({ body }) => {
                assert.strictEqual(body.Message, 'Deleted post successful');
            });
    });

    test('participate-success', async () => {
        let postId1;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                maxParticipants: 5,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.PostId;
            });
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test2@test.com',
                password: '1234'
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=1')
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'Joined successfull' });
            });
    });

    test('participate-fail', async () => {
        let postId1;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                maxParticipants: 5,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.PostId;
            });
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: '1234'
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=1')
            .expect(400)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'An error occured. Please try again' });
            });
    });

    test('cancel-success', async () => {
        let postId1;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                maxParticipants: 5,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.PostId;
            });
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test2@test.com',
                password: '1234'
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=1');
        await agent
            .put('/posts/' + postId1 + '/join?join=0')
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'Canceled successfull' });
            });
    });

    test('cancel-fail', async () => {
        let postId1;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                maxParticipants: 5,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.PostId;
            });
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test2@test.com',
                password: '1234'
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=0')
            .expect(400)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'An error occured. Please try again' });
            });
    });
});
