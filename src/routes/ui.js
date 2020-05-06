'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const utils = require('../utils.js');
const Device = require('../models/device.js');
const Config = require('../models/config.js');
const Log = require('../models/log.js');
const ScheduleManager = require('../models/schedule-manager.js');
const Migrator = require('../services/migrator.js');
const defaultData = require('../data/default.js');

const timezones = require('../../static/data/timezones.json');

const providers = [
    { name: 'GoCheats' },
    { name: 'Kevin' },
];

// UI Routes
router.get(['/', '/index'], async function(req, res) {
    if (req.session.loggedin) {
        var username = req.session.username;
        var devices = await Device.getAll();
        var configs = await Config.getAll();
        var schedules = ScheduleManager.getAll();
        var metadata = await Migrator.getEntries();
        var logsSize = await Log.getTotalSize();
        var delta = 15 * 60;
        var data = defaultData;
        data.logged_in = true; // TODO: Workaround
        data.metadata = metadata;
        data.devices = devices.length;
        data.configs = configs.length;
        data.schedules = Object.keys(schedules).length;
        data.username = username;
        data.devices_offline = devices.filter(x => x.last_seen < (Math.round((new Date()).getTime() / 1000) - delta));
        data.devices_offline.forEach(function(device) {
            device.last_seen = utils.getDateTime(device.last_seen);
        });
        data.devices_online_count = devices.filter(x => x.last_seen >= (Math.round((new Date()).getTime() / 1000) - delta)).length;
        data.devices_offline_count = data.devices_offline.length;
        data.logs_size = utils.formatBytes(logsSize);
        res.render('index', data);
    }
});

router.get('/login', function(req, res) {
    var data = defaultData;
    data.logged_in = false;
    data.username = null;
    res.render('login', data);
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) throw err;
        res.redirect('/login');
    });
});

router.get('/account', function(req, res) {
    var data = defaultData;
    data.username = req.session.username;
    res.render('account', data);
});

// Device UI Routes
router.get('/devices', function(req, res) {
    res.render('devices', defaultData);
});

router.get('/device/new', async function(req, res) {
    var data = defaultData;
    data.configs = await Config.getAll();
    res.render('device-new', defaultData);
});

router.get('/device/edit/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var data = defaultData;
    var configs = await Config.getAll();
    var device = await Device.getByName(uuid);
    if (device.config) {
        configs.forEach(function(config) {
            config.selected = config.name === device.config;
        });
    } else {
        data.nothing_selected = true;
    }
    data.configs = configs;
    data.uuid = device.uuid;
    data.old_uuid = device.uuid;
    data.config = device.config;
    data.clientip = device.clientip;
    data.notes = device.notes;
    res.render('device-edit', data);    
});

router.get('/device/logs/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var data = defaultData;
    data.uuid = uuid;
    res.render('device-logs', data);
});

router.get('/device/delete/:uuid', async function(req, res) {
    var data = defaultData;
    data.uuid = req.params.uuid;
    res.render('device-delete', data);
});

router.get('/device/manage/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var device = await Device.getByName(uuid);
    var data = defaultData;
    data.name = uuid;
    data.listeners = config.listeners;
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
router.get('/configs', function(req, res) {
    res.render('configs', defaultData);
});

router.get('/config/new', function(req, res) {
    var data = defaultData;
    data.providers = providers;
    res.render('config-new', data);
});

router.get('/config/edit/:name', async function(req, res) {
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

router.get('/config/delete/:name', function(req, res) {
    var data = defaultData;
    data.name = req.params.name;
    res.render('config-delete', data);
});

// Schedule UI Routes
router.get('/schedules', function(req, res) {
    res.render('schedules', defaultData);
});

router.get('/schedule/new', async function(req, res) {
    var data = defaultData;
    var configs = await Config.getAll();
    var devices = await Device.getAll();
    data.configs = configs;
    data.devices = devices;
    data.timezones = timezones;
    res.render('schedule-new', data);
});

router.get('/schedule/edit/:name', async function(req, res) {
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

router.get('/schedule/delete/:name', function(req, res) {
    var data = defaultData;
    data.name = req.params.name;
    res.render('schedule-delete', data);
});

// Settings UI Routes
router.get('/settings', function(req, res) {
    var data = defaultData;
    data.title = config.title;
    data.host = config.db.host;
    data.port = config.db.port;
    data.db_username = config.db.username;
    data.db_password = config.db.password;
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
        { 'name': 'es' },
        { 'name': 'de' }
    ];
    data.languages.forEach(function(locale) {
        locale.selected = locale.name === config.locale;
    });
    data.logging = config.logging.enabled ? 'checked' : '';
    data.max_size = config.logging.max_size;
    res.render('settings', data);
});

module.exports = router;