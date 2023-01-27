const request = require('supertest');
const assert = require('assert');

const association = require('../../models/association/association');
const sequelize = require('../../database/in-memory');

const app = require('../../app');

beforeEach(async () => {
    association();
    return await sequelize
        .sync({ force: true })
        .catch(err => {
            console.log(err);
        });
});

describe('UserTest', () => {
    test('addUser-success', async () => {
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
            .expect(201);
    });

    test('addUser-fail-password-not-match', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: '1234',
                confirmPassword: '1241'
            })
            .expect(400);
    });

    test('addUser-fail-email-already-used', async () => {
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
                email: 'test@test.com',
                username: 'testuser',
                password: '1234',
                confirmPassword: '1234'
            })
            .expect(400);
    });

    test('getUsers', async () => {
        let userId;
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
            })
            .then(({ body }) => {
                userId = body.UserId;
            });
        await request(app)
            .get('/users?username=testuser2')
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(
                    body, [{
                        id: userId,
                        username: 'testuser2',
                        email: 'test2@test.com'
                    }]
                );
            });
    });

    test('getUser-success', async () => {
        let userId;
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
            .expect(201)
            .then(res => {
                userId = res.body.UserId;
            });
        await request(app)
            .get('/users/' + userId)
            .expect(200)
            .then(({body})=>{
                assert.deepStrictEqual(body,{
                    id: userId,
                    email: 'test@test.com',
                    username: 'testuser',
                    Tags: []
                });
            });
    });

    test('getUser-failed', async () => {
        await request(app)
            .get('/users/' + 250)
            .expect(404);
    });

    test('deleteUser-success', async () => {
        let userId;
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
            .then(res => {
                userId = res.body.UserId;
            });
        await request(app)
            .delete('/users/' + userId)
            .expect(200)
            .then(res => {
                assert.equal(res.body.message, 'Deleted user successfull');
            });
    });

    test('deleteUser-failed', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: '1234'
            })
        await request(app)
            .delete('/users/' + 404)
            .expect(404)
            .then(res => {
                assert.equal(res.body.message, 'No such user');
            });
    });

    test('updateUser-success', async () => {
        let userId;
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
            .then(res => {
                userId = res.body.UserId;
            });
        await request(app)
            .put('/users/' + userId)
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                username: 'pikachu',
                password: '9999'
            })
            .expect(200)
            .then(res => {
                assert.equal(res.body.message, 'Updated user successfull');
            });
        await request(app)
            .get('/users/' + userId)
            .expect(200)
            .then(({body}) => {
                assert.deepStrictEqual(body, {
                    id: userId,
                    email: 'test@test.com',
                    username: 'pikachu',
                    Tags: []
                });
            });
    });

    test('updateUser-failed', async () => {
        await request(app)
            .put('/users/' + 404)
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                username: 'pikachu',
                password: '9999'
            })
            .expect(404)
            .then(res => {
                assert.equal(res.body.message, 'No such user');
            });
    });
});