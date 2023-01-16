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
                tags: ['aaa','bbb','ccc'],
                title: 'TestPost',
                userId: 1,
                boardId: 1,
                context: 'Anything ...',
            })
            .expect(200)
            .then(({body}) => {
                // console.log(body);
                assert.deepStrictEqual({
                    title:body.title,
                    userId: body.UserId,
                    boardId: body.BoardId,
                    context: body.context,
                    tags: body.Tags.map(tag => tag.tagName)
                }, {
                    title: 'TestPost',
                    userId: 1,
                    boardId: 1,
                    context: 'Anything ...',
                    tags: ['aaa','bbb','ccc']
                });
            });
    });

    // test('getPosts', async () => {
    //     await request(app)
    //         .post('/posts')
    //         .set('Accept', 'application/json')
    //         .type('application/json')
    //         .send({
    //             title: 'TestPost',
    //             userId: 1,
    //             boardId: 1,
    //             context: 'Anything ...'
    //         });
    //     await request(app)
    //         .get('/posts?userId=1')
    //         .then(res => {
    //             console.log(res.body);
    //             assert.fail();
    //         });
    // });
});
