'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const mustacheExpress = require('mustache-express');

const config = require('./config.json');
const Device = require('./models/device.js');
const Config = require('./models/config.js');
const Migrator = require('./migrator.js');
const ScheduleManager = require('./models/schedule-manager.js');
const apiRoutes = require('./routes/api.js');

const timezones = require('../static/data/timezones.json');

// TODO: Create route classes
// TODO: iOS and IPA version
// TODO: Fix devices scroll with DataTables
// TODO: Secure /api/config/:uuid endpoint with token
// TODO: Provider option to show/hide config options
// TODO: Accomodate for # in uuid name

const defaultData = {
    title: config.title,
    locale: config.locale,
    style: config.style == 'dark' ? 'dark' : '',
    logging: config.logging
};

// Start database migrator
var dbMigrator = new Migrator();
dbMigrator.load();

// Middleware
app.set('view engine', 'mustache');
app.set('views', path.resolve(__dirname, 'views'));
app.engine('mustache', mustacheExpress());
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
//app.use(bodyParser.raw({ type: 'application/x-www-form-urlencoded' }));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../static')));
app.use('/screenshots', express.static(path.resolve(__dirname, '../screenshots')));

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
        var data = defaultData;
        data.metadata = metadata;
        data.devices = devices.length;
        data.configs = configs.length;
        data.schedules = Object.keys(schedules).length;
        data.username = username;
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
    res.render('config-new', defaultData);
});

app.get('/config/edit/:name', async function(req, res) {
    var name = req.params.name;
    var c = await Config.getByName(name);
    var data = defaultData;
    data.title = config.title;
    data.old_name = name;
    data.name = c.name;
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
        style.selected = style.name === config.style
    });
    data.languages = [
        { 'name': 'en' },
        { 'name': 'es' }
    ];
    data.languages.forEach(function(locale) {
        locale.selected = locale.name === config.locale
    });
    data.logging = config.logging ? 'checked' : '';
    console.log("Settings:", data);
    res.render('settings', data);
});

app.listen(config.port, config.interface, () => console.log(`Listening on port ${config.port}...`));