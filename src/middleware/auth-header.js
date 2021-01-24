'use strict';

const config = require('../config.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return false;
    }
    const bearer = authHeader.split(' ')[1];
    if ((bearer || '').toLowerCase() !== (config.token || '').toLowerCase()) {
        return false;
    }
    //return true;
    return next();
};