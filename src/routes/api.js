'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const request = require('request');

const screenshotsDir = path.resolve(__dirname, '../../screenshots');
const upload = multer({ dest: screenshotsDir });

const config = require('../config.json');
const Account = require('../models/account.js');
const Config = require('../models/config.js');
const Device = require('../models/device.js');
const Log = require('../models/log.js');
const ScheduleManager = require('../models/schedule-manager.js');
const logger = require('../services/logger.js');
const utils = require('../services/utils.js');

router.use((req, res, next) => {
    if (req.path === '/api/login' || req.path === '/login' ||
        req.path === '/config' || req.path === '/log/new') {
        return next();
    }
    if (req.session.loggedin) {
        next();
        return;
    }
    res.redirect('/login');
});

// Authentication API Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const result = await Account.getAccount(username, password);
        if (result) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/');
            return;
        } else {
            logger('dcm').error('Incorrect Username and/or Password!');
        }			
    } else {
        logger('dcm').error('Username or password is empty!');
    }
    res.redirect('/login');
});

router.post('/account/change_password/:username', async (req, res) => {
    const { username, oldPassword, password, password2 } = req.body;
    // TODO: show error
    if (password !== password2) {
        logger('dcm').error('Passwords do not match');
        res.redirect('/account');
        return;
    }
    const exists = await Account.getAccount(username, oldPassword);
    if (exists) {
        const result = await Account.changePassword(username, oldPassword, password);
        if (result) {
            // Success
            logger('dcm').info(`Successfully changed password for user ${username} from ${oldPassword} to ${password}.`);
        } else {
            // Failed
            logger('dcm').error(`Unexpected error occurred trying to change password for user ${username}`);
        }
    } else {
        // Failed
        logger('dcm').error(`Account with username ${username} does not exist`);
    }
    res.redirect('/account');
});


// Settings API Routes
router.post('/settings/change', (req, res) => {
    const data = req.body;
    const newConfig = config;
    newConfig.title = data.title;
    newConfig.locale = data.locale;
    newConfig.style = data.style;
    newConfig.listeners = data.listeners ? data.listeners.split(',') || []: [];
    newConfig.monitor = {
        enabled: data.monitor_enabled === 'on',
        threshold: data.monitor_threshold,
        interval: data.monitor_interval,
        webhooks: data.monitor_webhooks ? data.webhooks.split(',') || [] : [],
        reboot: data.monitor_reboot === 'on'
    };
    newConfig.logging = {
        enabled: data.logging === 'on',
        max_size: data.max_size,
        format: data.log_format
    };
    newConfig.db = {
        host: data.host,
        port: data.port,
        username: data.db_username,
        password: data.db_password,
        database: data.database,
        charset: data.charset
    };
    fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(newConfig, null, 4));
    res.redirect('/settings');
});


// Device API Routes
router.get('/devices', async (req, res) => {
    try {
        const devices = await Device.getAll();
        let previewSize = req.query.previewSize;
        if (devices) {
            for (let i = 0; i < devices.length; i++) {
                let device = devices[i];
                const screenshotPath = path.join(screenshotsDir, device.uuid + '.png');
                const exists = fs.existsSync(screenshotPath);
                // Device received a config last 15 minutes
                const delta = 15 * 60;
                const isOffline = device.last_seen > (Math.round((new Date()).getTime() / 1000) - delta) ? 0 : 1;
                const image = isOffline ? '/img/offline.png' : (exists ? `/screenshots/${device.uuid}.png` : '/img/online.png');
                const lastModified = exists && !isOffline ? (await utils.fileLastModifiedTime(screenshotPath)).toLocaleString() : '';
                device.image = `<img src='${image}' width='${previewSize}' height='auto' style='margin-left: auto;margin-right: auto;display: block;' class='deviceImage' /><br><div class='text-center'><small>${lastModified}</small></div>`;
                device.last_seen = utils.getDateTime(device.last_seen * 1000);
                device.buttons = `
                <div class="btn-group" role="group" style="float: right;">
                    <button id="deviceActionsDropdown" type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Actions
                    </button>
                    <div class="dropdown-menu" aria-labelledby="deviceActionsDropdown">
                        <a href="/device/manage/${device.uuid}" class="dropdown-item">Manage</a>
                        <div class="dropdown-divider"></div>
                        <a href="/device/edit/${device.uuid}" class="dropdown-item">Edit</a>
                        <a href="/device/logs/${device.uuid}" class="dropdown-item">Logs</a>
                    </div>
                </div>`;
            }
        }
        res.json({
            data: {
                devices: devices
            }
        });
    } catch (e) {
        logger('dcm').error(`Devices error: ${e}`);
    }
});

router.post('/devices/mass_action', async (req, res) => {
    const type = req.body.type;
    let endpoint = '';
    switch (type) {
    case 'screenshot':
        logger('dcm').info('Received screenshot mass action');
        res.send('Received screenshot');
        endpoint = 'screen';
        break;
    case 'restart':
        logger('dcm').info('Received restart mass action');
        res.send('Received restart');
        endpoint = 'restart';
        break;
    case 'restart_config':
        logger('dcm').info('Received restart by config mass action');
        endpoint = 'restart_config';
        break;
    default:
        res.send('Error Occurred');
    }
    if (endpoint !== '') {
        let devices = await Device.getAll();
        if (devices) {
            const config = req.body.config;
            // If config was included then filter devices based on config assigned
            if (config) {
                logger('dcm').info(`Filtering devices based on config ${config}`);
                devices = devices.filter(x => x.config === config);
            }
            devices.forEach((device) => {
                const ip = device.clientip;
                if (ip) {
                    const host = `http://${ip}:8080/${endpoint}`;
                    get(device.uuid, host);
                }
            });
        }
    }
});

router.post('/device/new', async (req, res) => {
    const data = req.body;
    const result = await Device.create(
        data.uuid,
        data.config || null,
        null,
        data.clientip || null,
        null,
        null,
        data.notes || null,
        data.enabled || null
    );
    if (result) {
        // Success
    }
    logger('dcm').info(`New device result: ${result}`);
    res.redirect('/devices');
});

router.post('/device/edit/:uuid', async (req, res) => {
    const {
        uuid,
        config,
        clientip,
        notes,
        enabled
    } = req.body;
    let device = await Device.getByName(uuid);
    if (device) {
        device.config = config || null;
        device.clientip = clientip || null;
        device.notes = notes || null;
        device.enabled = enabled || null;
        const result = await device.save();
        if (!result) {
            logger('dcm').error(`Failed to update device ${uuid}`);
            return;
        }
        logger('dcm').info(`Device ${uuid} updated`);
        // Success
    }
    res.redirect('/devices');
});

// Kevin screenshot support
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
                logger('dcm').error(err);
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
        fs.unlink(tempPath, (err) => {
            if (err) {
                logger('dcm').error(err);
            }
            res.status(200)
                .contentType('text/plain')
                .end('ERROR');
        });
    }
});

router.post('/device/screen/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    logger('dcm').info(`Received screen ${uuid}`);
    const data = Buffer.from(req.body.body, 'base64');
    const screenshotFile = path.resolve(__dirname, '../../screenshots/' + uuid + '.png');
    fs.writeFile(screenshotFile, data, (err) => {
        if (err) {
            logger('dcm').error('Failed to save screenshot');
        }
    });
    res.sendStatus(200).end();
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
        let configs = await Config.getAll();
        configs.forEach((config) => {
            config.is_default = config.is_default ? 'Yes' : 'No';
            config.buttons = `
            <div class='btn-group' role='group' style='float: right;'>
                <button id='configActionsDropdown' type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    Actions
                </button>
                <div class='dropdown-menu' aria-labelledby='configActionsDropdown'>
                    <a href='/config/edit/${config.name}' class='dropdown-item btn-primary'>Edit</a>
                    <a href='/config/delete/${config.name}' class='dropdown-item btn-danger'>Delete</a>
                    <div class='dropdown-divider'></div>
                    <button type='button' class='dropdown-item btn btn-danger' onclick='restart("${config.name}")'>Restart Devices</button>
                </div>
            </div>
            `;
        });
        res.send({
            data: {
                configs: configs
            }
        });
    } catch (e) {
        logger('dcm').error(`Configs error: ${e}`);
    }
});

router.post('/config', async (req, res) => {
    const { uuid, ios_version, ipa_version } = req.body;
    let device = await Device.getByName(uuid);
    let noConfig = false;
    let assignDefault = false;
    // Check for a proxied IP before the normal IP and set the first one that exists
    const clientip = ((req.headers['x-forwarded-for'] || '').split(', ')[0]) || (req.connection.remoteAddress).match('[0-9]+.[0-9].+[0-9]+.[0-9]+$')[0];
    logger('dcm').info(`Client ${uuid} at ${clientip} is requesting a config.`);

    // Check if device config is empty, if not provide it as json response
    if (device) {
        // Device exists
        device.lastSeen = new Date() / 1000;
        // Only update client IP if it hasn't been set yet.
        if (device.clientip === null) {
            device.clientip = clientip;
        }
        device.iosVersion = ios_version;
        device.ipaVersion = ipa_version;
        device.save();
        if (device.config) {
            // Nothing to do besides respond with config
        } else {
            logger('dcm').info(`Device ${uuid} not assigned a config, attempting to assign the default config if one is set...`);
            // Not assigned a config
            assignDefault = true;
        }
    } else {
        logger('dcm').info('Device does not exist, creating...');
        // Device doesn't exist, create db entry
        const ts = new Date() / 1000;
        device = await Device.create(uuid, null, ts, clientip, ios_version, ipa_version);
        if (device) {
            // Success, assign default config if there is one.
            assignDefault = true;
        } else {
            // Failed to create device so don't give config response
            noConfig = true;
        }
    }

    if (!device.enabled) {
        logger('dcm').error(`Device ${uuid} not enabled!`);
        res.json({
            status: 'error',
            error: 'Device not enabled!'
        });
        return;
    }  

    if (assignDefault) {
        const defaultConfig = await Config.getDefault();
        if (defaultConfig !== null) {
            logger('dcm').info(`Assigning device ${uuid} default config ${defaultConfig.name}`);
            device.config = defaultConfig.name;
            device.save();
        } else {    
            // No default config so don't give config response
            noConfig = true;
        }
    }

    if (noConfig) {
        logger('dcm').error(`No config assigned to device ${uuid} and no default config to assign!`);
        res.json({
            status: 'error',
            error: 'Device not assigned to config!'
        });
        return;
    }
    
    const c = await Config.getByName(device.config);
    if (c === null) {
        logger('dcm').error(`Failed to grab config ${device.config}`);
        res.json({
            status: 'error',
            error: 'Device not assigned to config!'
        });
        return;
    }

    // Build json config
    const json = utils.buildConfig(
        c.provider,
        c.backendUrl,
        c.dataEndpoints,
        c.token,
        c.heartbeatMaxTime,
        c.minDelayLogout,
        c.loggingUrl,
        c.loggingPort,
        c.accountManager,
        c.deployEggs,
        c.nearbyTracker,
        c.autoLogin,
        c.isDefault
    );
    logger('dcm').info(`${uuid} config response: ${json}`);
    res.send(json);
});

router.post('/config/new', async (req, res) => {
    const data = req.body;
    const cfg = await Config.create(
        data.name,
        data.provider,
        data.backend_url,
        data.data_endpoints,
        data.token,
        data.heartbeat_max_time,
        data.min_delay_logout,
        data.logging_url,
        data.logging_port,
        data.account_manager === 'on' ? 1 : 0,
        data.deploy_eggs === 'on' ? 1 : 0,
        data.nearby_tracker === 'on' ? 1 : 0,
        data.auto_login === 'on' ? 1 : 0,
        data.is_default === 'on' ? 1 : 0
    );
    if (cfg) {
        logger('dcm').info('Config inserted');
        if (cfg.isDefault) {
            logger('dcm').info(`Setting default config: ${data.name}`);
            await Config.setDefault(data.name);
        }
    } else {
        logger('dcm').error('Failed to create new config');
    }
    res.redirect('/configs');
});

router.post('/config/edit/:name', async (req, res) => {
    const oldName = req.params.name;
    const data = req.body;
    const c = await Config.getByName(oldName);
    c.name = data.name;
    c.provider = data.provider;
    c.backendUrl = data.backend_url;
    c.dataEndpoints = data.data_endpoints;
    c.token = data.token;
    c.heartbeatMaxTime = data.heartbeat_max_time;
    c.minDelayLogout = data.min_delay_logout;
    c.loggingUrl = data.logging_url;
    c.loggingPort = data.logging_port;
    c.accountManager = data.account_manager === 'on' ? 1 : 0;
    c.deployEggs = data.deploy_eggs === 'on' ? 1 : 0;
    c.nearbyTracker = data.nearby_tracker === 'on' ? 1 : 0;
    c.autoLogin = data.auto_login === 'on' ? 1 : 0;
    c.isDefault = data.is_default === 'on' ? 1 : 0;
    if (await c.save(oldName)) {
        logger('dcm').info('Config saved');
        // Success
        if (c.isDefault) {
            logger('dcm').info(`Setting default config: ${c.name}`);
            await Config.setDefault(c.name);
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
    let schedules = ScheduleManager.getAll();
    const list = Object.values(schedules);
    if (list) {
        list.forEach((schedule) => {
            schedule.uuids = (schedule.uuids || []).join(',');
            schedule.buttons = `<a href='/schedule/edit/${schedule.name}'><button type='button' class='btn btn-primary'>Edit</button></a>
                                <a href='/schedule/delete/${schedule.name}'><button type='button'class='btn btn-danger'>Delete</button></a>`;
            schedule.enabled ? 'Yes' : 'No'; // TODO: Fix yes/no doesn't get set
        });
    }
    res.json({ data: { schedules: list } });
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
        logger('dcm').info('Schedule inserted');
    } else {
        logger('dcm').error('Failed to create new schedule');
    }
    res.redirect('/schedules');
});

router.post('/schedule/edit/:name', (req, res) => {
    const data = req.body;
    const oldName = req.params.name;
    const result = ScheduleManager.update(
        oldName,
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
        logger('dcm').info('Schedule', data.name, 'updated');
    } else {
        logger('dcm').error(`Failed to update schedule ${oldName}`);
    }
    res.redirect('/schedules');
});

router.post('/schedule/delete/:name', (req, res) => {
    const name = req.params.name;
    const result = ScheduleManager.delete(name);
    if (result) {
        // Success
        logger('dcm').info(`Schedule ${name} deleted`);
    }
    res.redirect('/schedules');
});

router.get('/schedule/delete_all', (req, res) => {
    const result = ScheduleManager.deleteAll();
    if (result) {
        // Success
        logger('dcm').info('All schedules deleted');
    }
    res.redirect('/schedules');
});


// Logging API requests
router.get('/logs/delete_all', (req, res) => {
    const result = Log.deleteAll();
    if (result) {
        // Success
    }
    res.redirect('/settings');
});

router.get('/logs/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const logs = await Log.getByDevice(uuid);
    res.send({
        uuid: uuid,
        data: {
            logs: logs || []
        }
    });
});

router.post('/log/new', async (req, res) => {
    if (!config.logging.enabled) {
        // Logs are disabled
        res.send('OK');
        return;
    }

    // REVIEW: Update device last_seen?
    const { uuid, messages } = req.body;
    if (messages) {
        for (let i = messages.length - 1; i >= 0; i--) {
            logger(uuid).info(messages[i]);
            //console.log('[SYSLOG]', messages[i]);
        }
    }
    res.send('OK');
});

router.get('/log/delete/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const result = await Log.delete(uuid);
    if (result) {
        // Success
    }
    res.redirect('/device/logs/' + uuid);
});

router.get('/log/export/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    let logText = '';
    const logs = await Log.getByDevice(uuid);
    if (logs) {
        logs.forEach((log) => {
            logText += `${log.timestamp} ${log.uuid} ${log.message}\n`;
        });
    }
    res.send(logText);
});

const get = async (uuid, url) => {
    const isScreen = url.includes('/screen');
    if (isScreen) {
        const screenshotFile = path.resolve(__dirname, '../../screenshots/' + uuid + '.png');
        const fileStream = fs.createWriteStream(screenshotFile);
        request
            .get(url)
            .on('error', (err) => {
                logger('dcm').error(`Failed to get screenshot for ${uuid} at ${url}. Are you sure the device is up? ${err.code}`);
            })
            .pipe(fileStream);
    } else {
        request.get(url, (err) => {
            if (err) {
                logger('dcm').error(`Error: ${err}`);
            }
        }).on('error', (err) => {
            logger('dcm').error(`Error occurred: ${err}`);
        });
    }
};

module.exports = router;
