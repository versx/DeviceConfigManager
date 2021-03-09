'use strict';

const config = require('../config.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return false;
    }
    const bearer = authHeader.split(' ')[1];
    if (config.tokens.length > 0 && !config.tokens.includes((bearer || '').toLowerCase())) {
        return false;
    }
    //return true;
    return next();
};