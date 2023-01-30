const request = require('supertest');
const assert = require('assert');
const should = require('should');

const association = require('../../models/association/association');
const sequelize = require('../../database/in-memory');
const app = require('../../app');

let userId1, userId2, boardId, postId1, postId2, token;

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
        .post('/login')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            email: 'test@test.com',
            password: '1234'
        })
        .expect(200)
        .then(({ body }) => {
            token = body.token;
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
        .post('/users')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            email: 'admin@test.com',
            username: 'testuser',
            password: '1234',
            confirmPassword: '1234'
        });
    await request(app)
        .post('/login')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
            email: 'admin@test.com',
            password: '1234'
        })
        .expect(200)
        .then(({ body }) => {
            token = body.token;
        });
    await request(app)
        .post('/boards')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '+token)
        .type('application/json')
        .send({
            boardName: 'NewBoard'
        })
        .then(({ body }) => {
            boardId = body.UserId;
        });;
    await request(app)
        .post('/posts')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .type('application/json')
        .send({
            tags: ['aaa', 'bbb', 'ccc'],
            title: 'TestPost1',
            boardId: boardId,
            context: 'Anything ...',
        })
        .then(({ body }) => {
            postId1 = body.PostId;
        });

});

describe('CommentTest', () => {
    test('addComment-success-no-childComments', async () => {
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                postId: postId1,
                context: 'This is comment'
            })
            .expect(201);
    });
    test('addComment-success-childComments', async () => {
        let commentId;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                postId: postId1,
                context: 'This is comment'
            })
            .then(({ body }) => {
                // console.log(body);
                commentId = body.CommentId;
            });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                commentId: commentId,
                postId: postId1,
                context: 'SubComments'
            })
            .expect(201);
    });
    test('getComments', async () => {
        let commentId1, commentId2;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                postId: postId1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                commentId: commentId1,
                postId: postId1,
                context: 'SubComments'
            });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                postId: postId1,
                context: 'This is comment2'
            })
            .then(({ body }) => { commentId2 = body.CommentId; });;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                commentId: commentId2,
                postId: postId1,
                context: 'SubComments2'
            });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                commentId: commentId2,
                postId: postId1,
                context: 'SubComments3'
            });
        await request(app)
            .get('/comments?postId=1')
            .expect(200);
        await request(app)
            .get('/comments?commentId=' + commentId2)
            .expect(200)
            .then(({ body }) => {
                body.map(({ context }) => context).should.containDeep(['SubComments2', 'SubComments3']);
            });
    });
    test('getComment', async () => {
        let commentId1;
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                postId: postId1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await request(app)
            .get('/comments/' + commentId1)
            .expect(200)
            .then(({ body }) => {
                body.should.have.value('context', 'This is comment1');
            });
    });
    test('updateComments', async () => {
        let commentId1, token;
        const agent = request.agent(app);
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: '1234'
            })
            .then(({ body }) => {
                token = body.token;
            });
        await agent
            .post('/comments')
            .set('Authorization', 'Bearer ' + token)
            .send({
                postId: postId1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await agent
            .put('/comments/' + commentId1)
            .set('Authorization', 'Bearer ' + token)
            .send({
                context: 'Updated Comment'
            })
            .expect(200);
        await agent
            .get('/comments/' + commentId1)
            .expect(200)
            .then(({ body }) => {
                body.should.have.value('context', 'Updated Comment');
            });
    });
    test('deleteComment', async () => {
        let commentId1, token;
        const agent = request.agent(app);
        await agent
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: '1234'
            })
            .then(({ body }) => {
                token = body.token;
            });
        await request(app)
            .post('/comments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                postId: postId1,
                context: 'This is comment1'
            })
            .then(({ body }) => { commentId1 = body.CommentId; });
        await request(app)
            .put('/comments/' + commentId1)
            .set('Authorization', 'Bearer ' + token)
            .send({
                deleted: 'Y'
            })
            .expect(200);
        await request(app)
            .get('/comments/' + commentId1)
            .expect(200)
            .then(({ body }) => {
                body.should.have.value('deleted', 'Y');
            });
    });
});