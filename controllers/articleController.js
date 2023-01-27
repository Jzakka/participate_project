const NewsAPI = require('newsapi');
const User = require('../models/user');
const Tag = require('../models/tag');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

module.exports.getArticles = async (req, res, next) => {

    if (!req.userId) {
        return newsapi.v2
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
            .findByPk(req.userId, { include: Tag })
            .then(foundUser => {
                return newsapi.v2
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