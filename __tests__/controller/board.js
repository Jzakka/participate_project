const request = require('supertest');
const assert = require('assert');
const association = require('../../models/association/association');
const sequelize = require('../../database/in-memory');

const app = require('../../app');

let token;

beforeEach(async () => {
    association();
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
            email: 'admin@test.com',
            username: 'testuser',
            password: '1234',
            confirmPassword: '1234'
        })
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
});

describe('BoardTest', () => {
    test('addBoard-success', async () => {
        await request(app)
            .post('/boards')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' +token)
            .type('application/json')
            .send({
                boardName: 'NewBoard'
            })
            .expect(201)
    });
    test('addBoard-fail-less-than-3letters', async () => {
        await request(app)
            .post('/boards')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' +token)
            .type('application/json')
            .send({
                boardName: 'aa'
            })
            .expect(422)
    });
    test('getBoards', async () => {
        await request(app)
            .post('/boards')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' +token)
            .type('application/json')
            .send({
                boardName: 'NewBoard'
            });
        await request(app)
            .get('/boards?board_name=NewBoard')
            .expect(200)
            .then(result => {
                assert.strictEqual(result.body[0].boardName, 'NewBoard');
                assert.notStrictEqual(result.body[0].boardName, 'OldBoard');
            });
    });
    test('deleteBoard-success', async () => {
        let boardId;
        await request(app)
            .post('/boards')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' +token)
            .type('application/json')
            .send({
                boardName: 'NewBoard'
            })
            .then(res => {
                boardId = res.body.BoardId;
            });
        await request(app)
            .delete('/boards/' + boardId)
            .set('Authorization', 'Bearer ' +token)
            .expect(200)
            .then(res => {
                assert.deepStrictEqual(res.body, { message: 'Deleted board successfull' });
            });
    });
    test('deleteBoard-fail', async () => {
        await request(app)
            .delete('/boards/' + 404)
            .set('Authorization', 'Bearer ' +token)
            .expect(404)
            .then(res => {
                assert.deepStrictEqual(res.body, { message: 'Failed to delete board' });
            });
    });
});