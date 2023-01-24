const NewsAPI = require('newsapi');
const User = require('../models/user');
const Tag = require('../models/tag');

require('dotenv').config();
const newspai = new NewsAPI(process.env.NEWS_API_KEY);

module.exports.getArticles = async (req, res, next) => {
    if (!req.session.user) {
        return newspai.v2
            .topHeadlines()
            .then(articles => {
                return res.status(200).json(articles);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ message: 'An error occured' });
            });
    } else {
        return await User
            .findByPk(req.session.user.id, { include: Tag })
            .then(foundUser => {
                return newspai.v2
                    .topHeadlines({
                        q: foundUser.Tags.map(tag => tag.tagName)
                    })
                    .then(articles => {
                        return res.status(200).json(articles);
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.status(500).json({ message: 'An error occured' });
                    });
            });

    }
};