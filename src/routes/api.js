'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../config.json');
const utils = require('../utils.js');

const screenshotsDir = path.resolve(__dirname, '../../screenshots');
const upload = multer({ dest: screenshotsDir });

const Account = require('../models/account.js');
const Config = require('../models/config.js');
const Device = require('../models/device.js');
const Log = require('../models/log.js');
const ScheduleManager = require('../models/schedule-manager.js');


// Authentication API Route
router.post('/login', async (req, res) => {
    const {username,password} = req.body;
    if (username && password) {
        const result = await Account.getAccount(username, password);
        if (result) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/');
            return;
        } else {
            console.log('Incorrect Username and/or Password!');
        }			
    } else {
        console.log('Username or password is empty!');
    }
    res.redirect('/login');
});

router.post('/account/change_password/:username', async (req, res) => {
    const username = req.params.username;
    const {oldPassword, password, password2} = req.body;
    //console.log('Username:', username, 'Old Password:', oldPassword, 'New Password:', password, 'Confirm Password:', password2);
    // TODO: show error
    if (password !== password2) {
        console.error('Passwords do not match');
        res.redirect('/account');
        return;
    }
    const exists = await Account.getAccount(username, oldPassword);
    if (exists) {
        // TODO: Update account in database
        const result = await Account.changePassword(username, oldPassword, password);
        if (result) {
            // Success
            console.log(`Successfully changed password for user ${username} from ${oldPassword} to ${password}.`);
        } else {
            // Failed
            console.log(`Unexpected error occurred trying to change password for user ${username}`);
        }
    } else {
        // Failed
        console.log(`Account with username ${username} does not exist`);
    }
    res.redirect('/account');
});


// Settings API Routes
router.post('/settings/change_ui', (req, res) => {
    const data = req.body;
    const newConfig = config;
    newConfig.title = data.title;
    newConfig.locale = data.locale;
    newConfig.style = data.style;
    newConfig.logging = data.logging === 'on' ? 1 : 0;
    fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(newConfig, null, 2));
    res.redirect('/settings');
});

router.post('/settings/change_db', (req, res) => {
    const data = req.body;
    const newConfig = config;
    newConfig.db.host = data.host;
    newConfig.db.port = data.port;
    newConfig.db.username = data.username;
    newConfig.db.password = data.password;
    newConfig.db.database = data.database;
    newConfig.db.charset = data.charset;
    fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(newConfig, null, 2));
    res.redirect('/settings');
});


// Device API Routes
router.get('/devices', async (req, res) => {
    try {
        const devices = await Device.getAll();
        devices.forEach(device => {
            const exists = fs.existsSync(path.join(screenshotsDir, device.uuid + '.png'));
            // Device received a config last 15 minutes
            const delta = 15 * 60;
            const isOffline = device.last_seen > (Math.round((new Date()).getTime() / 1000) - delta) ? 0 : 1;
            const image = exists ? `/screenshots/${device.uuid}.png` : (isOffline ? '/img/offline.png' : '/img/online.png');
            device.image = `<a href='${image}' target='_blank'><img src='${image}' width='72' height='96'/></a>`;
            device.last_seen = utils.getDateTime(device.last_seen);
            device.buttons = `
            <div class='btn-group' role='group'>
                <a href='/device/manage/${device.uuid}' class='btn btn-success'>Manage</a>
                <a href='/config/assign/${device.uuid}' class='btn btn-primary'>Assign</a>
                <a href='/device/logs/${device.uuid}' class='btn btn-secondary'>Logs</a>
            </div>`;
        });
        const json = JSON.stringify({ data: { devices: devices } });
        res.send(json);
    } catch (e) {
        console.error('Devices error:', e);
    }
});

router.post('/device/new', async (req, res) => {
    const uuid = req.body.uuid;
    const config = req.body.config || null;
    const clientip = req.body.clientip || null;
    const result = await Device.create(uuid, config, null, clientip);
    if (result) {
        // Success
    }
    console.log('New device result:', result);
    res.redirect('/devices');
});

router.post('/device/:uuid/screen', upload.single('file'), (req, res) => {
    const uuid = req.params.uuid;
    const fileName = uuid + '.png';
    const tempPath = req.file.path;
    const targetPath = path.join(screenshotsDir, fileName);
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }
    //console.log('File:', req.file);
    //console.log('Temp Path:', tempPath, 'Target Path:', targetPath, 'Original FileName:', req.file.originalname);
    if (path.extname(req.file.originalname).toLowerCase() === '.png' ||
        path.extname(req.file.originalname).toLowerCase() === '.jpg' ||
        path.extname(req.file.originalname).toLowerCase() === '.jpeg') {
        fs.rename(tempPath, targetPath, (err) => {
            if (err) {
                console.error(err);
                res.status(500)
                    .contentType('text/plain')
                    .end('ERROR');
                return;
            }
            res.status(200)
                .contentType('text/plain')
                .end('OK');
        });
    } else {
        fs.unlink(tempPath, err => {
            if (err) {
                console.error(err);
            }
            res.status(200)
                .contentType('text/plain')
                .end('ERROR');
        });
    }
});

router.post('/device/delete/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const result = await Device.delete(uuid);
    if (result) {
        // Success
    }
    res.redirect('/devices');
});


// Config API requests
router.get('/configs', async (req, res) => {
    try {
        const configs = await Config.getAll();
        configs.forEach(config => {
            config.is_default = config.is_default ? 'Yes' : 'No';
            config.buttons = `<a href='/config/edit/${config.name}'><button type='button' class='btn btn-primary'>Edit</button></a>
                              <a href='/config/delete/${config.name}'><button type='button'class='btn btn-danger'>Delete</button></a>`;
        });
        const json = JSON.stringify({ data: { configs: configs } });
        res.send(json);
    } catch (e) {
        console.error('Configs error:', e);
    }
});

router.post('/config', async (req, res) => {
    const data = req.body;
    const uuid = data.uuid;
    const iosVersion = data.ios_version;
    const ipaVersion = data.ipa_version;
    let device = await Device.getByName(uuid);
    let noConfig = false;
    let assignDefault = false;
    // Check for a proxied IP before the normal IP and set the first one that exists
    const clientip = ((req.headers['x-forwarded-for'] || '').split(', ')[0]) || (req.connection.remoteAddress).match('[0-9]+.[0-9].+[0-9]+.[0-9]+$')[0];
    console.log('[' + new Date().toLocaleString() + ']', 'Client', uuid, 'at', clientip, 'is requesting a config.');

    // Check if device config is empty, if not provide it as json response
    if (device) {
        // Device exists
        device.lastSeen = new Date() / 1000;
        device.clientip = clientip;
        device.iosVersion = iosVersion;
        device.ipaVersion = ipaVersion;
        device.save();
        if (device.config) {
            // Nothing to do besides respond with config
        } else {
            console.log('Device', uuid, 'not assigned a config, attempting to assign the default config if one is set...');
            // Not assigned a config
            assignDefault = true;
        }
    } else {
        console.log('Device does not exist, creating...');
        // Device doesn't exist, create db entry
        const ts = new Date() / 1000;
        device = await Device.create(uuid, null, ts, clientip, iosVersion, ipaVersion);
        if (device) {
            // Success, assign default config if there is one.
            assignDefault = true;
        } else {
            // Failed to create device so don't give config response
            noConfig = true;
        }
    }

    if (assignDefault) {
        const defaultConfig = await Config.getDefault();
        if (defaultConfig !== null) {
            console.log('Assigning device', uuid, 'default config', defaultConfig.name);
            device.config = defaultConfig.name;
            device.save();
        } else {    
            // No default config so don't give config response
            noConfig = true;
        }
    }

    if (noConfig) {
        console.error('No config assigned to device', uuid, 'and no default config to assign!');
        const noConfigData = {
            status: 'error',
            error: 'Device not assigned to config!'
        };
        res.send(JSON.stringify(noConfigData));
        return;
    }
    
    const c = await Config.getByName(device.config);
    if (c === null) {
        console.error('Failed to grab config', device.config);
        const noConfigData2 = {
            status: 'error',
            error: 'Device not assigned to config!'
        };
        res.send(JSON.stringify(noConfigData2));
        return;
    }
    // Build json config
    const json = utils.buildConfig(
        c.backendUrl,
        c.dataEndpoints,
        c.token,
        c.heartbeatMaxTime,
        c.minDelayLogout,
        c.accountManager,
        c.deployEggs,
        c.nearbyTracker,
        c.autoLogin,
        c.isDefault
    );
    console.log(uuid, 'config response:', json);
    res.send(json);
});

router.post('/config/assign/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const config = req.body.config;
    const device = await Device.getByName(uuid);
    if (device) {
        device.config = config;
        const result = await device.save();
        if (result) {
            // Success
        }
    }
    res.redirect('/devices');
});

router.post('/config/new', async (req, res) => {
    const data = req.body;
    const result = await Config.create(
        data.name,
        data.backend_url,
        data.data_endpoints,
        data.token,
        data.heartbeat_max_time,
        data.min_delay_logout,
        data.account_manager === 'on' ? 1 : 0,
        data.deploy_eggs === 'on' ? 1 : 0,
        data.nearby_tracker === 'on' ? 1 : 0,
        data.auto_login === 'on' ? 1 : 0,
        data.is_default === 'on' ? 1 : 0
    );
    if (result) {
        console.log('Config inserted');
    } else {
        console.error('Failed to create new config');
    }
    res.redirect('/configs');
});

router.post('/config/edit/:name', async (req, res) => {
    const oldName = req.params.name;
    const data = req.body;
    const c = await Config.getByName(oldName);
    c.name = data.name;
    c.backendUrl = data.backend_url;
    c.dataEndpoints = data.data_endpoints;
    c.token = data.token;
    c.heartbeatMaxTime = data.heartbeat_max_time;
    c.minDelayLogout = data.min_delay_logout;
    c.accountManager = data.account_manager === 'on' ? 1 : 0;
    c.deployEggs = data.deploy_eggs === 'on' ? 1 : 0;
    c.nearbyTracker = data.nearby_tracker === 'on' ? 1 : 0;
    c.autoLogin = data.auto_login === 'on' ? 1 : 0;
    c.isDefault = data.is_default === 'on' ? 1 : 0;
    if (await c.save(oldName)) {
        // Success
        if (c.isDefault) {
            await Config.setDefault(oldName);
        }
    }
    res.redirect('/configs');
});

router.post('/config/delete/:name', async (req, res) => {
    const name = req.params.name;
    const result = await Config.delete(name);
    if (result) {
        // Success
    }
    res.redirect('/configs');
});


// Schedule API requests
router.get('/schedules', async (req, res) => {
    const schedules = ScheduleManager.getAll();
    const list = Object.values(schedules);
    if (list) {
        list.forEach((schedule) => {
            schedule.buttons = `<a href='/schedule/edit/${schedule.name}'><button type='button' class='btn btn-primary'>Edit</button></a>
                                <a href='/schedule/delete/${schedule.name}'><button type='button'class='btn btn-danger'>Delete</button></a>`;
            schedule.enabled ? 'Yes' : 'No'; // TODO: Fix yes/no doesn't get set
        });
    }
    res.send({ data: { schedules: list } });
});

router.post('/schedule/new', (req, res) => {
    const data = req.body;
    const result = ScheduleManager.create(
        data.name,
        data.config,
        data.devices,
        data.start_time,
        data.end_time,
        data.timezone,
        data.next_config,
        data.enabled === 'on' ? 1 : 0
    );
    if (result) {
        console.log('Schedule inserted');
    } else {
        console.error('Failed to create new schedule');
    }
    res.redirect('/schedules');
});

router.post('/schedule/edit/:name', (req, res) => {
    const oldName = req.params.name;
    const {
        name,
        config,
        devices,
        start_time,
        end_time,
        timezone,
        next_config
    } = req.body.data;
    const enabled = req.body.enabled === 'on' ? 1 : 0;
    const result = ScheduleManager.update(oldName, name, config, devices, start_time, end_time, timezone, next_config, enabled);
    if (result) {
        console.log('Schedule', name, 'updated');
    } else {
        console.error('Failed to update schedule', oldName);
    }
    res.redirect('/schedules');
});

router.post('/schedule/delete/:name', (req, res) => {
    const name = req.params.name;
    const result = ScheduleManager.delete(name);
    if (result) {
        // Success
        console.log('Schedule', name, 'deleted');
    }
    res.redirect('/schedules');
});

router.get('/schedule/delete_all', (req, res) => {
    const result = ScheduleManager.deleteAll();
    if (result) {
        // Success
        console.log('All schedules deleted');
    }
    res.redirect('/schedules');
});


// Logging API requests
router.get('/logs/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const logs = Log.getByDevice(uuid);
    res.send({
        uuid: uuid,
        data: {
            logs: logs || []
        }
    });
});

router.post('/log/new', (req, res) => {
    if (config.logging === false) {
        // Logs are disabled
        res.send('OK');
        return;
    }
    const uuid = req.body.uuid;
    const messages = req.body.messages;
    if (messages) {
        messages.forEach(message => {
            const result = Log.create(uuid, message);
            if (result) {
                // Success
            }
            console.log('[SYSLOG]', uuid, ':', message);
        });
    }
    res.send('OK');
});

router.get('/log/delete/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const result = Log.delete(uuid);
    if (result) {
        // Success
    }
    res.redirect('/device/logs/' + uuid);
});

router.get('/logs/delete_all', (req, res) => {
    const result = Log.deleteAll();
    if (result) {
        // Success
    }
    res.redirect('/logs');
});

module.exports = router;