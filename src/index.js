'use strict';

const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const app = express();
const mustacheExpress = require('mustache-express');
const i18n = require('i18n');
const helmet = require('helmet');

const config = require('./config.json');
const defaultData = require('./data/default.js');
const apiRoutes = require('./routes/api.js');
const uiRoutes = require('./routes/ui.js');
const logger = require('./services/logger.js');
const Migrator = require('./services/migrator.js');
const DeviceMonitor = require('./services/device-monitor.js');
const utils = require('./services/utils.js');

// TODO: Fix devices scroll with DataTables
// TODO: Secure /api/config endpoint with token
// TODO: Success/error responses
// TODO: Test/fix schedules changing days
// TODO: Webhook for device reboots
// TODO: Get device model in config request
// TODO: Send coord changes to DCM via client

require('events').defaultMaxListeners = 300;

const run = async () => {
    // Start database migrator
    const dbMigrator = new Migrator();
    dbMigrator.load();

    // Wait until migrations are done to proceed
    while (!dbMigrator.done) {
        await utils.snooze(1000);
    }

    // Basic security protection middleware
    app.use(helmet());

    // View engine
    app.set('view engine', 'mustache');
    app.set('views', path.resolve(__dirname, 'views'));
    app.engine('mustache', mustacheExpress());

    // Static paths
    app.use(express.static(path.resolve(__dirname, '../static')));
    app.use('/screenshots', express.static(path.resolve(__dirname, '../screenshots')));

    // Body parser middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Initialize localzation handler
    i18n.configure({
        locales:['en', 'es', 'de'],
        directory: path.resolve(__dirname, '../static/locales')
    });
    app.use(i18n.init);
    
    // Register helper as a locals function wrroutered as mustache expects
    app.use((req, res, next) => {
        // Mustache helper
        res.locals.__ = () => {
            /* eslint-disable no-unused-vars */
            return (text, render) => {
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
    app.use((req, res, next) => {
        if (req.path === '/api/login' || req.path === '/login' || req.path === '/api/config' || req.path == '/api/log/new') {
            return next();
        }
        if (req.session.loggedin) {
            defaultData.logged_in = true;
            return next();
        }
        res.redirect('/login');
    });

    // API routes
    app.use('/api', apiRoutes);

    // CSRF token middleware
    app.use(cookieParser());
    app.use(csrf({ cookie: true }));
    app.use((req, res, next) => {
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
    app.listen(config.port, config.interface, () => logger('dcm').info(`Listening on port ${config.port}...`));

    if (config.monitor.enabled) {
        DeviceMonitor.start();
    }
};

run().then(x => {
    console.log('Initialized');
}).catch(err => {
    console.error('Error:', err);
});