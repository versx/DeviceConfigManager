'use strict';

const config = require('../config.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return false;
    }

    if (!config.tokens) return next(); // unsure we should allow that
    const bearer = authHeader.split(' ')[1];

    for (const allowed_token of config.tokens) {
        if ((bearer || 'empty').toLowerCase() == (allowed_token || '').toLowerCase()) return next();
    }

    return false;
};
