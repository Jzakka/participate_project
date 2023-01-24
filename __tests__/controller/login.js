const request = require('supertest');
const should = require('should');

const association = require('../../models/association/association');
const sequelize = require('../../database/in-memory');
const app = require('../../app');

let userId1, userId2;

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
});

describe('authTest', () => {
    test('loginTest', redirect => {
        const agent = request.agent(app);
        agent
            .post('/login')
            .send({
                email: 'test@test.com',
                password: '1234'
            })
            .expect('Location', '/')
            .expect(302)
            .end(redirect);
    });
    test('logoutTest', redirect => {
        const agent = request.agent(app);
        agent
            .put('/logout')
            .expect('Location', '/')
            .expect(302)
            .end(redirect);
    });
});