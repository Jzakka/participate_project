const request = require('supertest');
const assert = require('assert');
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
        });;
    return await request(app)
        .post('/boards')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            boardName: 'NewBoard'
        })
        .then(({ body }) => {
            boardId = body.BoardId;
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
                userId: userId1,
                boardId: boardId,
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
                userId: userId1,
                boardId: boardId,
                context: 'Anything ...',
            });
        await request(app)
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                tags: ['aaa', 'ccc'],
                title: 'TestPost2',
                userId: userId1,
                boardId: boardId,
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
                boardId: boardId,
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
                userId: userId1,
                boardId: boardId,
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
                userId: userId1,
                boardId: boardId,
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
                userId: userId1,
                boardId: boardId,
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
                    UserId: userId1,
                    BoardId: boardId,
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
        let postId1, token;
        const agent = request.agent(app);
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: '1234'
            })
            .expect(200)
            .then(({body})=>{
                token=body.token;
            });
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '+token)
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: userId1,
                boardId: boardId,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.PostId
            });
        await agent
            .put('/posts/' + postId1)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '+token)
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
        await agent
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
                    UserId: userId1,
                    BoardId: boardId,
                    Tags: ['updated', 'tag']
                }, body);
            });
    });

    test('updatePost-fail', async () => {
        let token;
        const agent = request.agent(app);
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: '1234'
            })
            .expect(200)
            .then(({body})=>{
                token=body.token;
            });
        await agent
            .put('/posts/' + 404)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .expect(404)
            .send({
                title: 'UpdatedPost',
                context: 'The context was updated',
                tags: ['updated', 'tag']
            })
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'No such post' });
            });
    });

    test('deletePost-success', async () => {
        let postId1, token;
        const agent = request.agent(app);
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: '1234'
            })
            .expect(200)
            .then(({body})=>{
                token=body.token;
            });
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: userId1,
                boardId: boardId,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.PostId;
            });
        await agent
            .delete('/posts/' + postId1)
            .set('Authorization', 'Bearer '+token)
            .expect(200)
            .then(({ body }) => {
                assert.strictEqual(body.Message, 'Deleted post successful');
            });
    });

    test('deletePost-fail-not-authorized', async () => {
        let postId1
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: userId1,
                boardId: boardId,
                context: 'Anything ...',
                tags: ['aaa', 'ccc']
            })
            .then(({ body }) => {
                postId1 = body.PostId;
            });
        await agent
            .delete('/posts/' + postId1)
            .expect(401);
    });

    test('participate-success', async () => {
        let postId1, token;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: userId1,
                boardId: boardId,
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
            })
            .expect(200)
            .then(({body})=>{
                token=body.token;
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=1')
            .set('Authorization', 'Bearer '+token)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'Joined successfull' });
            });
    });

    test('participate-fail-user-already-participated', async () => {
        let postId1,token;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: userId1,
                boardId: boardId,
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
            })
            .expect(200)
            .then(({body})=>{
                token=body.token;
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=1')
            .set('Authorization', 'Bearer '+token)
            .expect(400)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'An error occured. Please try again' });
            });
    });

    test('cancel-success', async () => {
        let postId1, token;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: userId1,
                boardId: boardId,
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
            })
            .expect(200)
            .then(({body})=>{
                token=body.token;
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=1')
            .set('Authorization', 'Bearer '+token);
        await agent
            .put('/posts/' + postId1 + '/join?join=0')
            .set('Authorization', 'Bearer '+token)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'Canceled successfull' });
            });
    });

    test('cancel-fail-user-not-participated', async () => {
        let postId1, token;
        const agent = request.agent(app);
        await agent
            .post('/posts')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                title: 'TestPost',
                userId: userId1,
                boardId: boardId,
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
            })
            .expect(200)
            .then(({body})=>{
                token=body.token;
            });
        await agent
            .put('/posts/' + postId1 + '/join?join=0')
            .set('Authorization', 'Bearer '+token)
            .expect(400)
            .then(({ body }) => {
                assert.deepStrictEqual(body, { message: 'An error occured. Please try again' });
            });
    });
});
