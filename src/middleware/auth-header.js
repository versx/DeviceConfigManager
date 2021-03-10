'use strict';

const config = require('../config.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.sendStatus(403);
    }
    const bearer = authHeader.split(' ')[1];
    if (config.tokens.length > 0 && !config.tokens.includes((bearer || '').toLowerCase())) {
        return res.sendStatus(403);
    }
    //return true;
    return next();
};