'use strict';

const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const mustacheExpress = require('mustache-express');
const i18n = require('i18n');

const config = require('./config.json');
const utils = require('./utils.js');
const Migrator = require('./services/migrator.js');
const apiRoutes = require('./routes/api.js');
const uiRoutes = require('./routes/ui.js');
const defaultData = require('./data/default.js');

// TODO: Fix devices scroll with DataTables
// TODO: Secure /api/config endpoint with token
// TODO: Change require to import

run();

async function run() {
    // Start database migrator
    var dbMigrator = new Migrator();
    dbMigrator.load();

    // Wait until migrations are done to proceed
    while (!dbMigrator.done) {
        await utils.snooze(1000);
    }

    // View engine
    app.set('view engine', 'mustache');
    app.set('views', path.resolve(__dirname, 'views'));
    app.engine('mustache', mustacheExpress());

    // Static paths
    app.use(express.static(path.resolve(__dirname, '../static')));
    app.use('/screenshots', express.static(path.resolve(__dirname, '../screenshots')));

    // Body parser middlewares
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })); // for parsing application/x-www-form-urlencoded

    // Initialize localzation handler
    i18n.configure({
        locales:['en', 'es', 'de'],
        directory: path.resolve(__dirname, '../static/locales')
    });
    app.use(i18n.init);
    
    // Register helper as a locals function wrroutered as mustache expects
    app.use(function(req, res, next) {
        // Mustache helper
        res.locals.__ = function() {
            /* eslint-disable no-unused-vars */
            return function(text, render) {
                return i18n.__.routerly(req, arguments);
            };
            /* eslint-disable no-unused-vars */
        };
        next();
    });
    
    // Set locale
    i18n.setLocale(config.locale);

    // Sessions middleware
    app.use(session({
        secret: config.secret, // REVIEW: Randomize?
        resave: true,
        saveUninitialized: true
    }));
    
    // Login middleware
    app.use(function(req, res, next) {
        if (req.path === '/api/login' || req.path === '/login' || req.path === '/api/config') {
            return next();
        }
        if (req.session.loggedin) {
            defaultData.logged_in = true;
            return next();
            //return;
        }
        /*
        if (defaultData.csrf === req.csrfToken()) {
            //console.log("TOKEN GOOD");
            return next();
        }
        */
        res.redirect('/login');
    });

    // API routes
    app.use('/api', apiRoutes);

    // CSRF token middleware
    app.use(cookieParser());
    app.use(csrf({ cookie: true }));
    app.use(function(req, res, next) {
        var csrf = req.csrfToken();
        defaultData.csrf = csrf;
        //console.log("CSRF Token:", csrf);
        res.cookie('x-csrf-token', csrf);
        res.cookie('TOKEN', csrf);
        res.locals.csrftoken = csrf;
        next();
    });

    // UI routes
    app.use('/', uiRoutes);

    // Start listener
    app.listen(config.port, config.interface, () => console.log(`Listening on port ${config.port}...`));
}