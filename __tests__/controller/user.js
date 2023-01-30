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
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .expect(201);
    });

    test('addUser-fail-password-invalid', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: '333',
                confirmPassword: '333'
            })
            .expect(422);
    });

    test('addUser-fail-email-invalid', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'testtest.com',
                username: 'testuser',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .expect(422);
    });

    test('addUser-fail-username-invalid', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .expect(422);
    });

    test('addUser-fail-password-not-match', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: 'qlalfqjsgh111',
                confirmPassword: 'qlalfqjsghghghgh33'
            })
            .expect(422);
    });

    test('addUser-fail-email-already-used', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            });
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .expect(422);
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
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            });
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test2@test.com',
                username: 'testuser2',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
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
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .expect(201)
            .then(res => {
                userId = res.body.UserId;
            });
        await request(app)
            .get('/users/' + userId)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, {
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
        let userId, token;
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .then(res => {
                userId = res.body.UserId;
            });
        await request(app)
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: 'qlalfqjsgh123'
            })
            .expect(200)
            .then(({ body }) => {
                token = body.token;
            });
        await request(app)
            .delete('/users/' + userId)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(res => {
                assert.equal(res.body.message, 'Deleted user successfull');
            });
    });

    test('deleteUser-failed-not-authorized', async () => {
        let token;
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .expect(201);
        await request(app)
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: 'qlalfqjsgh123'
            })
            .expect(200)
            .then(({ body }) => {
                token = body.token;
            });
        await request(app)
            .delete('/users/' + 404)
            .set('Authorization', 'Bearer ' + token)
            .expect(401);
    });

    test('updateUser-success', async () => {
        let userId, token;
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: 'qlalfqjsgh123',
                confirmPassword: 'qlalfqjsgh123'
            })
            .then(res => {
                userId = res.body.UserId;
            });
        await request(app)
            .post('/login')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                password: 'qlalfqjsgh123'
            })
            .expect(200)
            .then(({ body }) => {
                token = body.token;
            });
        await request(app)
            .put('/users/' + userId)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .type('application/json')
            .send({
                username: 'pikachu',
                password: 'qlalfqjsgh123'
            })
            .expect(200)
            .then(res => {
                assert.equal(res.body.message, 'Updated user successfull');
            });
        await request(app)
            .get('/users/' + userId)
            .expect(200)
            .then(({ body }) => {
                assert.deepStrictEqual(body, {
                    id: userId,
                    email: 'test@test.com',
                    username: 'pikachu',
                    Tags: []
                });
            });
    });

    test('updateUser-failed-not-authorized', async () => {        
        await request(app)
            .put('/users/' + 404)
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                username: 'pikachu',
                password: 'qlalfqjsgh123'
            })
            .expect(401);
    });
});