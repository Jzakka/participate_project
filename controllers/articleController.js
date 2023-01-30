const _ = require('lodash');
const NewsAPI = require('newsapi');
const User = require('../models/user');
const Tag = require('../models/tag');

require('dotenv').config();
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

module.exports.getArticles = async (req, res, next) => {
    if (!req.userId) {
        return newsapi.v2
            .topHeadlines()
            .then(articles => {
                return res.status(200).json(articles);
            })
            .catch(err => {
                err.statusCode ??= 500;
                next(err);
            });
    } else {
        return User
            .findByPk(req.userId, { include: Tag })
            .then(foundUser => {
                if (!foundUser) {
                    const err = new Error('No such user');
                    err.statusCode = 404;
                    throw err;
                }
                if (_.isEmpty(foundUser.Tags)) {
                    return newsapi.v2.topHeadlines();
                }
                return newsapi.v2.topHeadlines({q: foundUser.Tags.map(tag=>tag.tagName)});
            })
            .then(articles => {
                return res.status(200).json(articles);
            })
            .catch(err => {
                err.statusCode ??= 500;
                next(err);
            });
    }
};