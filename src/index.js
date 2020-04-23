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
const apiRoutes = require('./routes/api.js');

// TODO: Create route classes
// TODO: Error checking/handling
// TODO: Secure password

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
app.use(express.static(path.resolve(__dirname, '../static')));
app.use('/screenshots', express.static(path.resolve(__dirname, '../screenshots')));

// Sessions middleware
app.use(session({
    secret: config.secret, // REVIEW: Randomize?
    resave: true,
    saveUninitialized: true
}));

// Login middleware
app.use(function(req, res, next) {
    if (req.path === '/api/login' || req.path === '/login') {
        return next();
    }
    if (req.session.loggedin) {
        defaultData.logged_in = true;
        next();
        return;
    }
    res.redirect('/login');
});

// API Route
app.use('/api', apiRoutes);

// UI Routes
app.get(['/', '/index'], async function(req, res) {
    if (req.session.loggedin) {
        var username = req.session.username;
        var devices = await Device.getAll();
        var configs = await Config.getAll();
        var metadata = await Migrator.getEntries();
        var data = defaultData;
        data.metadata = metadata;
        data.devices = devices.length;
        data.configs = configs.length;
        data.username = username;
        res.render('index', data);
    }
});

app.get('/login', function(req, res) {
    var data = defaultData;
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
        if (device.clientip === null) {
            console.error('Failed to get IP address.');
        } else {
            data.clientip = device.clientip;
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
    data.port = c.port;
    data.heartbeat_max_time = c.heartbeatMaxTime;
    data.pokemon_max_time = c.pokemonMaxTime;
    data.raid_max_time = c.raidMaxTime;
    data.startup_lat = c.startupLat;
    data.startup_lon = c.startupLon;
    data.token = c.token;
    data.jitter_value = c.jitterValue;
    data.max_warning_time_raid = c.maxWarningTimeRaid;
    data.encounter_delay = c.encounterDelay;
    data.min_delay_logout = c.minDelayLogout;
    data.max_empty_gmo = c.maxEmptyGmo;
    data.max_failed_count = c.maxFailedCount;
    data.max_no_quest_count = c.maxNoQuestCount;
    data.logging_url = c.loggingUrl;
    data.logging_port = c.loggingPort;
    data.logging_tls = c.loggingTls === 1 ? 'checked' : '';
    data.logging_tcp = c.loggingTcp === 1 ? 'checked' : '';
    data.account_manager = c.accountManager === 1 ? 'checked' : '';
    data.deploy_eggs = c.deployEggs === 1 ? 'checked' : '';
    data.nearby_tracker = c.nearbyTracker === 1 ? 'checked' : '';
    data.auto_login = c.autoLogin === 1 ? 'checked' : '';
    data.ultra_iv = c.ultraIV === 1 ? 'checked' : '';
    data.ultra_quests = c.ultraQuests === 1 ? 'checked' : '';
    data.is_default = c.isDefault === 1 ? 'checked' : '';
    res.render('config-edit', data);
});

app.get('/config/delete/:name', function(req, res) {
    var data = defaultData;
    data.name = req.params.name;
    res.render('config-delete', data);
});

// Settings UI Routes
app.get('/settings', function(req, res) {
    res.render('settings', defaultData);
});

app.listen(config.port, config.interface, () => console.log(`Listening on port ${config.port}...`));