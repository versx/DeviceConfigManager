'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config.json');
const utils = require('../utils.js');
const defaultData = require('../data/default.js');
const Config = require('../models/config.js');
const Device = require('../models/device.js');
const Log = require('../models/log.js');
const ScheduleManager = require('../models/schedule-manager.js');
const logger = require('../services/logger.js');
const Migrator = require('../services/migrator.js');

const timezones = require('../../static/data/timezones.json');

const providers = [
    { name: 'GoCheats' },
    { name: 'Kevin' },
    { name: 'AI' }
];

// UI Routes
router.get(['/', '/index'], async function(req, res) {
    if (req.session.loggedin) {
        const username = req.session.username;
        const devices = await Device.getAll();
        const configs = await Config.getAll();
        const schedules = ScheduleManager.getAll();
        const metadata = await Migrator.getEntries();
        const logsSize = await Log.getTotalSize();
        const delta = 15 * 60;
        const data = defaultData;
        data.logged_in = true; // TODO: Workaround
        data.metadata = metadata;
        data.devices = devices.length;
        data.configs = configs.length;
        data.schedules = Object.keys(schedules).length;
        data.username = username;
        data.devices_offline = devices.filter(x => x.last_seen < (Math.round((new Date()).getTime() / 1000) - delta));
        data.devices_offline.forEach(function(device) {
            device.last_seen = utils.getDateTime(device.last_seen * 1000);
        });
        data.devices_online_count = devices.filter(x => x.last_seen >= (Math.round((new Date()).getTime() / 1000) - delta)).length;
        data.devices_offline_count = data.devices_offline.length;
        data.logs_size = utils.formatBytes(logsSize);
        data.version = require('../../package.json').version;
        res.render('index', data);
    }
});

router.get('/login', function(req, res) {
    const data = defaultData;
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
    const data = defaultData;
    data.username = req.session.username;
    res.render('account', data);
});

// Device UI Routes
router.get('/devices', function(req, res) {
    res.render('devices', defaultData);
});

router.get('/device/new', async function(req, res) {
    const data = defaultData;
    data.configs = await Config.getAll();
    res.render('device-new', defaultData);
});

router.get('/device/edit/:uuid', async function(req, res) {
    const uuid = req.params.uuid;
    const data = defaultData;
    const configs = await Config.getAll();
    const device = await Device.getByName(uuid);
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
    const uuid = req.params.uuid;
    const data = defaultData;
    data.uuid = uuid;
    res.render('device-logs', data);
});

router.get('/device/delete/:uuid', async function(req, res) {
    const data = defaultData;
    data.uuid = req.params.uuid;
    res.render('device-delete', data);
});

router.get('/device/manage/:uuid', async function(req, res) {
    const uuid = req.params.uuid;
    const device = await Device.getByName(uuid);
    const data = defaultData;
    data.name = uuid;
    data.listeners = config.listeners;
    if (device) {
        if (device.clientip) {
            data.clientip = device.clientip;
        } else {
            logger('dcm').error(`Failed to get IP address for device ${uuid}`);
        }
    }
    res.render('device-manage', data);
});

// Config UI Routes
router.get('/configs', function(req, res) {
    res.render('configs', defaultData);
});

router.get('/config/new', function(req, res) {
    const data = defaultData;
    data.providers = providers;
    res.render('config-new', data);
});

router.get('/config/edit/:name', async function(req, res) {
    const name = req.params.name;
    const c = await Config.getByName(name);
    const data = defaultData;
    data.title = config.title;
    data.old_name = name;
    data.name = c.name;
    data.providers = providers;
    data.providers.forEach(function(provider) {
        provider.selected = provider.name === c.provider;
    });
    // TODO: Better way
    data.gocheats_selected = c.provider === data.providers[0].name;
    data.kevin_selected = c.provider === data.providers[1].name;
    data.ai_selected = c.provider === data.providers[2].name;
    data.backend_url = c.backendUrl;
    data.data_endpoints = c.dataEndpoints;
    data.token = c.token;
    data.heartbeat_max_time = c.heartbeatMaxTime;
    data.min_delay_logout = c.minDelayLogout;
    data.logging_url = c.loggingUrl;
    data.logging_port = c.loggingPort;
    data.account_manager = c.accountManager === 1 ? 'checked' : '';
    data.deploy_eggs = c.deployEggs === 1 ? 'checked' : '';
    data.nearby_tracker = c.nearbyTracker === 1 ? 'checked' : '';
    data.auto_login = c.autoLogin === 1 ? 'checked' : '';
    data.is_default = c.isDefault === 1 ? 'checked' : '';
    res.render('config-edit', data);
});

router.get('/config/delete/:name', function(req, res) {
    const data = defaultData;
    data.name = req.params.name;
    res.render('config-delete', data);
});

// Schedule UI Routes
router.get('/schedules', function(req, res) {
    res.render('schedules', defaultData);
});

router.get('/schedule/new', async function(req, res) {
    const data = defaultData;
    const configs = await Config.getAll();
    const devices = await Device.getAll();
    data.configs = configs;
    data.devices = devices;
    data.timezones = timezones;
    res.render('schedule-new', data);
});

router.get('/schedule/edit/:name', async function(req, res) {
    const name = req.params.name;
    const data = defaultData;
    const configs = await Config.getAll();
    const devices = await Device.getAll();
    const schedule = ScheduleManager.getByName(name);
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
    const data = defaultData;
    data.name = req.params.name;
    res.render('schedule-delete', data);
});

// Settings UI Routes
router.get('/settings', function(req, res) {
    const data = defaultData;
    data.title = config.title;
    //data.host = config.db.host;
    //data.port = config.db.port;
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
    data.listeners = (config.listeners || '').join(',');
    data.webhooks = (config.webhooks || '').join(',');
    data.logging = config.logging.enabled ? 'checked' : '';
    data.max_size = config.logging.max_size;
    data.log_format = config.logging.format;
    res.render('settings', data);
});

router.get('/logs', function(req, res) {
    res.render('logs', defaultData);
});

module.exports = router;