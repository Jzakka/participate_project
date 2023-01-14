const sequelize = require('../../database/in-memory');
const {association, User} = require('../../models/association/association');

beforeEach(async ()=>{
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

describe('user test', ()=>{
    test('add user', async ()=>{
            await User.create({
                email: "test@test.com",
                username: "testuser",
                password: "1234"
            });
            await User.create({
                email: "test2@test.com",
                username: "testuser2",
                password: "1234"
            });
            expect(await User.findAll()).toHaveLength(2);
    });
});