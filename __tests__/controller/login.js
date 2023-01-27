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
    test('loginTest', async () => {
        const agent = request.agent(app);
        await agent
            .post('/login')
            .send({
                email: 'test@test.com',
                password: '1234'
            })
            .expect(200)
            .then(({body})=>{
                console.log(body);
                body.should.have.properties(['token', 'userId']);
                body.userId.should.equal(userId1);
            });
    });
});