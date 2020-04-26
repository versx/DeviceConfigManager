'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const mustacheExpress = require('mustache-express');
const i18n = require('i18n');

const config = require('./config.json');
const utils = require('./utils.js');
const Device = require('./models/device.js');
const Config = require('./models/config.js');
const Log = require('./models/log.js');
const Migrator = require('./migrator.js');
const ScheduleManager = require('./models/schedule-manager.js');
const apiRoutes = require('./routes/api.js');

const timezones = require('../static/data/timezones.json');

// TODO: Create route classes
// TODO: Fix devices scroll with DataTables
// TODO: Delete all logs button
// TODO: Secure /api/config endpoint with token
// TODO: Accomodate for # in uuid name
// TODO: Localization
// TODO: Fix schedule end time
// TODO: Center align data in table columns
// TODO: Change require to import

const providers = [
    { name: 'GoCheats' },
    { name: 'Kevin' },
]

run();

async function run() {
    // Start database migrator
    var dbMigrator = new Migrator();
    dbMigrator.load();
    while (dbMigrator.done === false) {
        await utils.snooze(1000);
    }
    app.listen(config.port, config.interface, () => console.log(`Listening on port ${config.port}...`));
}

i18n.configure({
    locales:['en', 'es', 'de'],
    directory: path.resolve(__dirname, '../static/locales')
});

// View engine
app.set('view engine', 'mustache');
app.set('views', path.resolve(__dirname, 'views'));
app.engine('mustache', mustacheExpress());

// Static paths
app.use(express.static(path.resolve(__dirname, '../static')));
//app.use('/logs', express.static(path.resolve(__dirname, '../logs')));
app.use('/screenshots', express.static(path.resolve(__dirname, '../screenshots')));

//app.use(express.cookieParser());
app.use(i18n.init);

// register helper as a locals function wrapped as mustache expects
app.use(function (req, res, next) {
    // mustache helper
    res.locals.__ = function () {
        return function (text, render) {
            return i18n.__.apply(req, arguments);
        };
   };
   next();
});

// Default mustache data shared between pages
const defaultData = require('../static/locales/' + config.locale + '.json');
defaultData.title = config.title;
defaultData.locale = config.locale,
defaultData.style = config.style == 'dark' ? 'dark' : '',
defaultData.logging = config.logging.enabled

i18n.setLocale(config.locale);

// Body parser middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
//app.use(bodyParser.raw({ type: 'application/x-www-form-urlencoded' }));

// Sessions middleware
app.use(session({
    secret: config.secret, // REVIEW: Randomize?
    resave: true,
    saveUninitialized: true
}));

// API Route
app.use('/api', apiRoutes);

// Login middleware
app.use(function(req, res, next) {
    if (req.path === '/api/login' || req.path === '/login' || req.path.includes('/api/config')) {
        return next();
    }
    if (req.session.loggedin) {
        defaultData.logged_in = true;
        next();
        return;
    }
    res.redirect('/login');
});

// UI Routes
app.get(['/', '/index'], async function(req, res) {
    if (req.session.loggedin) {
        var username = req.session.username;
        var devices = await Device.getAll();
        var configs = await Config.getAll();
        var schedules = ScheduleManager.getAll();
        var metadata = await Migrator.getEntries();
        var logsSize = Log.getTotalSize();
        var data = defaultData;
        data.metadata = metadata;
        data.devices = devices.length;
        data.configs = configs.length;
        data.schedules = Object.keys(schedules).length;
        data.username = username;
        data.logs_size = utils.formatBytes(logsSize);
        res.render('index', data);
    }
});

app.get('/login', function(req, res) {
    var data = defaultData;
    data.logged_in = false;
    data.username = null;
    res.render('login', data);
});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) throw err;
        res.redirect('/login');
    });
});

app.get('/account', function(req, res) {
    var data = defaultData;
    data.username = req.session.username;
    res.render('account', data);
});

// Device UI Routes
app.get('/devices', function(req, res) {
    res.render('devices', defaultData);
});

app.get('/device/new', async function(req, res) {
    var data = defaultData;
    data.configs = await Config.getAll();
    res.render('device-new', defaultData);
});

app.get('/device/logs/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var data = defaultData;
    data.uuid = uuid;
    res.render('device-logs', data);
});

app.get('/device/delete/:uuid', async function(req, res) {
    var data = defaultData;
    data.uuid = req.params.uuid;
    res.render('device-delete', data);
});

app.get('/device/manage/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var device = await Device.getByName(uuid);
    var data = defaultData;
    data.name = uuid;
    if (device) {
        if (device.config) {
            var c = await Config.getByName(device.config);
            if (c === null) {
                console.error('Failed to grab config', device.config);
                return;
            } else {
                data.port = c.port;
            }
        }
        if (device.clientip) {
            data.clientip = device.clientip;
        } else {
            console.error('Failed to get IP address.');
        }
    }
    res.render('device-manage', data);
});

// Config UI Routes
app.get('/configs', function(req, res) {
    res.render('configs', defaultData);
});

app.get('/config/assign/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var device = await Device.getByName(uuid);
    var configs = await Config.getAll();
    var data = defaultData;
    if (device.config) {
        configs.forEach(function(cfg) {
            cfg.selected = (device.config === cfg.name);
        });
    } else {
        data.nothing_selected = true;
    }
    data.configs = configs;
    data.device = uuid;
    res.render('config-assign', data);
});

app.get('/config/new', function(req, res) {
    var data = defaultData;
    data.providers = providers;
    res.render('config-new', data);
});

app.get('/config/edit/:name', async function(req, res) {
    var name = req.params.name;
    var c = await Config.getByName(name);
    var data = defaultData;
    data.title = config.title;
    data.old_name = name;
    data.name = c.name;
    data.providers = providers;
    data.providers.forEach(function(provider) {
        provider.selected = provider.name === c.provider;
    });
    data.gocheats_selected = c.provider === data.providers[0].name;
    data.backend_url = c.backendUrl;
    data.data_endpoints = c.dataEndpoints;
    data.token = c.token;
    data.heartbeat_max_time = c.heartbeatMaxTime;
    data.min_delay_logout = c.minDelayLogout;
    data.account_manager = c.accountManager === 1 ? 'checked' : '';
    data.deploy_eggs = c.deployEggs === 1 ? 'checked' : '';
    data.nearby_tracker = c.nearbyTracker === 1 ? 'checked' : '';
    data.auto_login = c.autoLogin === 1 ? 'checked' : '';
    data.is_default = c.isDefault === 1 ? 'checked' : '';
    res.render('config-edit', data);
});

app.get('/config/delete/:name', function(req, res) {
    var data = defaultData;
    data.name = req.params.name;
    res.render('config-delete', data);
});

// Schedule UI Routes
app.get('/schedules', function(req, res) {
    res.render('schedules', defaultData);
});

app.get('/schedule/new', async function(req, res) {
    var data = defaultData;
    var configs = await Config.getAll();
    var devices = await Device.getAll();
    data.configs = configs;
    data.devices = devices;
    data.timezones = timezones;
    res.render('schedule-new', data);
});

app.get('/schedule/edit/:name', async function(req, res) {
    var name = req.params.name;
    var data = defaultData;
    var configs = await Config.getAll();
    var devices = await Device.getAll();
    var schedule = ScheduleManager.getByName(name);
    if (configs) {
        configs.forEach(function(cfg) {
            cfg.selected = cfg.name === schedule.config;
            cfg.next_config_selected = cfg.name === schedule.next_config;
        });
    }
    if (devices) {
        devices.forEach(function(device) {
            device.selected = schedule.uuids.includes(device.uuid);
        });
    }
    data.old_name = name;
    data.name = schedule.name;
    data.configs = configs;
    data.devices = devices;
    data.start_time = schedule.start_time;
    data.end_time = schedule.end_time;
    data.timezone = schedule.timezone;
    data.next_config = schedule.next_config;
    data.enabled = schedule.enabled === 1 ? 'checked' : '';
    timezones.forEach(function(timezone) {
        timezone.selected = timezone.value === schedule.timezone;
    });
    data.timezones = timezones;
    res.render('schedule-edit', data);
});

app.get('/schedule/delete/:name', function(req, res) {
    var data = defaultData;
    data.name = req.params.name;
    res.render('schedule-delete', data);
});

// Settings UI Routes
app.get('/settings', function(req, res) {
    var data = defaultData;
    data.title = config.title;
    data.host = config.db.host;
    data.port = config.db.port;
    data.username = config.db.username;
    data.password = config.db.password;
    data.database = config.db.database;
    data.charset = config.db.charset;
    data.styles = [
        { 'name': 'dark' },
        { 'name': 'light' }
    ];
    data.styles.forEach(function(style) {
        style.selected = style.name === config.style;
    });
    data.languages = [
        { 'name': 'en' },
        { 'name': 'es' }
    ];
    data.languages.forEach(function(locale) {
        locale.selected = locale.name === config.locale;
    });
    data.logging = config.logging.enabled ? 'checked' : '';
    data.max_size = config.logging.max_size;
    console.log('Settings:', data);
    res.render('settings', data);
});