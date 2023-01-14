const request = require('supertest');
const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const association = require('../../models/association/association');
const sequelize = require('../../database/in-memory');
const userController = require('../../controllers/userController');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/users', userController.addUser);
app.get('/users/:userId', userController.getUser);
app.get('/users', userController.getUsers);

beforeEach(async () => {
    association();
    return await sequelize
        .sync({ force: true })
        .then(() => {
            console.log('Model Sync Complete');
        })
        .catch(err => {
            console.log(err);
        });
});

describe('UserTest', () => {
    test('addUser', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: '1234'
            })
            .expect(200)
            .then(res => {
                assert.deepStrictEqual([
                    res.body.email,
                    res.body.username,
                    res.body.password
                ], [
                    'test@test.com',
                    'testuser',
                    '1234'
                ]);
            });
    });

    test('getUsers', async () => {
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test@test.com',
                username: 'testuser',
                password: '1234'
            });
        await request(app)
            .post('/users')
            .set('Accept', 'application/json')
            .type('application/json')
            .send({
                email: 'test2@test.com',
                username: 'testuser2',
                password: '1234'
            });
        await request(app)
            .get('/users?username=testuser2')
            .expect(200)
            .then(res => {
                assert.equal(res.body.length, 1);
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
                password: '1234'
            })
            .then(res => {
                userId = res.body.id;
            });
        await request(app)
            .get('/users/' + userId)
            .expect(200)
            .then(res => {
                assert.strictEqual(res.body.email, 'test@test.com');
                assert.strictEqual(res.body.username, 'testuser');
                assert.strictEqual(res.body.password, '1234');
            });
    });
});