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
const utils = require('../utils.js');
const Account = require('../models/account.js');
const Config = require('../models/config.js');
const Device = require('../models/device.js');
const Log = require('../models/log.js');
const ScheduleManager = require('../models/schedule-manager.js');
const logger = require('../services/logger.js');

router.use(function(req, res, next) {
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
router.post('/login', async function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        var result = await Account.getAccount(username, password);
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

router.post('/account/change_password/:username', async function(req, res) {
    var username = req.params.username;
    var oldPassword = req.body.old_password;
    var password = req.body.password;
    var password2 = req.body.password2;
    //console.log('Username:', username, 'Old Password:', oldPassword, 'New Password:', password, 'Confirm Password:', password2);
    // TODO: show error
    if (password !== password2) {
        console.error('Passwords do not match');
        res.redirect('/account');
        return;
    }
    var exists = await Account.getAccount(username, oldPassword);
    if (exists) {
        // TODO: Update account in database
        var result = await Account.changePassword(username, oldPassword, password);
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
router.post('/settings/change_ui', function(req, res) {
    var data = req.body;
    var newConfig = config;
    newConfig.title = data.title;
    newConfig.locale = data.locale;
    newConfig.style = data.style;
    newConfig.logging = {
        enabled: data.logging === 'on',
        max_size: data.max_size
    };
    fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(newConfig, null, 2));
    res.redirect('/settings');
});

router.post('/settings/change_db', function(req, res) {
    var data = req.body;
    var newConfig = config;
    newConfig.db.host = data.host;
    newConfig.db.port = data.port;
    newConfig.db.db_username = data.username;
    newConfig.db.db_password = data.password;
    newConfig.db.database = data.database;
    newConfig.db.charset = data.charset;
    fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(newConfig, null, 2));
    res.redirect('/settings');
});


// Device API Routes
router.get('/devices', async function(req, res) {
    try {
        var devices = await Device.getAll();
        if (devices) {
            for (var i = 0; i < devices.length; i++) {
                var device = devices[i];
                var screenshotPath = path.join(screenshotsDir, device.uuid + '.png');
                var exists = fs.existsSync(screenshotPath);
                // Device received a config last 15 minutes
                var delta = 15 * 60;
                var isOffline = device.last_seen > (Math.round((new Date()).getTime() / 1000) - delta) ? 0 : 1;
                var image = isOffline ? '/img/offline.png' : (exists ? `/screenshots/${device.uuid}.png` : '/img/online.png');
                var lastModified = exists && !isOffline ? (await utils.fileLastModifiedTime(screenshotPath)).toLocaleString() : '';
                device.image = `<a href='${image}' target='_blank'><img src='${image}' width='auto' height='96' style='margin-left: auto;margin-right: auto;display: block;'/></a><div class='text-center'>${lastModified}</div>`;
                device.last_seen = utils.getDateTime(device.last_seen);
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
        var json = JSON.stringify({ data: { devices: devices } });
        res.send(json);
    } catch (e) {
        console.error('Devices error:', e);
    }
});

router.post('/devices/mass_action', async function(req, res) {
    var type = req.body.type;
    var endpoint = '';
    switch (type) {
    case 'screenshot':
        console.log('Received screenshot mass action');
        res.send('Received screenshot');
        endpoint = 'screen';
        break;
    case 'restart':
        console.log('Received restart mass action');
        res.send('Received restart');
        endpoint = 'restart';
        break;
    default:
        res.send('Error Occurred');
    }
    if (endpoint !== '') {
        var devices = await Device.getAll();
        if (devices) {
            devices.forEach(function(device) {
                var ip = device.clientip;
                if (ip) {
                    // TODO: Get port via config
                    var host = `http://${ip}:8080/${endpoint}`;
                    get(device.uuid, host);
                }
            });
        }
    }
});

router.post('/device/new', async function(req, res) {
    var uuid = req.body.uuid;
    var config = req.body.config || null;
    var clientip = req.body.clientip || null;
    var notes = req.body.notes || null;
    var result = await Device.create(uuid, config, null, clientip, null, null, notes);
    if (result) {
        // Success
    }
    console.log('New device result:', result);
    res.redirect('/devices');
});

router.post('/device/edit/:uuid', async function(req, res) {
    var uuid = req.body.uuid;
    var config = req.body.config || null;
    var clientip = req.body.clientip || null;
    var notes = req.body.notes || null;
    var device = await Device.getByName(uuid);
    if (device) {
        device.config = config;
        device.clientip = clientip;
        device.notes = notes;
        var result = await device.save();
        if (!result) {
            console.error('Failed to update device', uuid);
            return;
        }
        console.log('Device', uuid, 'updated');
        // Success
    }
    res.redirect('/devices');
});

// Kevin screenshot support
router.post('/device/:uuid/screen', upload.single('file'), function(req, res) {
    var uuid = req.params.uuid;
    var fileName = uuid + '.png';
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
        fs.rename(tempPath, targetPath, function(err) {
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
        fs.unlink(tempPath, function(err) {
            if (err) {
                console.error(err);
            }
            res.status(200)
                .contentType('text/plain')
                .end('ERROR');
        });
    }
});

router.post('/device/screen/:uuid', function(req, res) {
    var uuid = req.params.uuid;
    console.log('Received screen');
    var data = Buffer.from(req.body.body, 'base64');
    var screenshotFile = path.resolve(__dirname, '../../screenshots/' + uuid + '.png');
    fs.writeFile(screenshotFile, data, function(err) {
        if (err) {
            console.error('Failed to save screenshot');
        }
    });
    res.sendStatus(200).end();
});

router.post('/device/delete/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var result = await Device.delete(uuid);
    if (result) {
        // Success
    }
    res.redirect('/devices');
});


// Config API requests
router.get('/configs', async function(req, res) {
    try {
        var configs = await Config.getAll();
        configs.forEach(function(config) {
            config.is_default = config.is_default ? 'Yes' : 'No';
            config.buttons = `<a href='/config/edit/${config.name}'><button type='button' class='btn btn-primary'>Edit</button></a>
                              <a href='/config/delete/${config.name}'><button type='button'class='btn btn-danger'>Delete</button></a>`;
        });
        var json = JSON.stringify({ data: { configs: configs } });
        res.send(json);
    } catch (e) {
        console.error('Configs error:', e);
    }
});

router.post('/config', async function(req, res) {
    var data = req.body;
    var uuid = data.uuid;
    var iosVersion = data.ios_version;
    var ipaVersion = data.ipa_version;
    var device = await Device.getByName(uuid);
    var noConfig = false;
    var assignDefault = false;
    // Check for a proxied IP before the normal IP and set the first one that exists
    var clientip = ((req.headers['x-forwarded-for'] || '').split(', ')[0]) || (req.connection.remoteAddress).match('[0-9]+.[0-9].+[0-9]+.[0-9]+$')[0];
    console.log('[' + new Date().toLocaleString() + ']', 'Client', uuid, 'at', clientip, 'is requesting a config.');

    // Check if device config is empty, if not provide it as json response
    if (device) {
        // Device exists
        device.lastSeen = new Date() / 1000;
        // Only update client IP if it hasn't been set yet.
        if (device.clientip === null) {
            device.clientip = clientip;
        }
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
        var ts = new Date() / 1000;
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
        var defaultConfig = await Config.getDefault();
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
        var noConfigData = {
            status: 'error',
            error: 'Device not assigned to config!'
        };
        res.send(JSON.stringify(noConfigData));
        return;
    }
    
    var c = await Config.getByName(device.config);
    if (c === null) {
        console.error('Failed to grab config', device.config);
        var noConfigData2 = {
            status: 'error',
            error: 'Device not assigned to config!'
        };
        res.send(JSON.stringify(noConfigData2));
        return;
    }

    // Build json config
    var json = utils.buildConfig(
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
    console.log(uuid, 'config response:', json);
    res.send(json);
});

router.post('/config/new', async function(req, res) {
    var data = req.body;
    var cfg = await Config.create(
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
        console.log('Config inserted');
        if (cfg.isDefault) {
            console.log('Setting default config:', data.name);
            await Config.setDefault(data.name);
        }
    } else {
        console.error('Failed to create new config');
    }
    res.redirect('/configs');
});

router.post('/config/edit/:name', async function(req, res) {
    var oldName = req.params.name;
    var data = req.body;
    var c = await Config.getByName(oldName);
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
        console.log('Config saved');
        // Success
        if (c.isDefault) {
            console.log('Setting default config:', c.name);
            await Config.setDefault(c.name);
        }
    }
    res.redirect('/configs');
});

router.post('/config/delete/:name', async function(req, res) {
    var name = req.params.name;
    var result = await Config.delete(name);
    if (result) {
        // Success
    }
    res.redirect('/configs');
});


// Schedule API requests
router.get('/schedules', async function(req, res) {
    var schedules = ScheduleManager.getAll();
    var list = Object.values(schedules);
    if (list) {
        list.forEach(function(schedule) {
            schedule.buttons = `<a href='/schedule/edit/${schedule.name}'><button type='button' class='btn btn-primary'>Edit</button></a>
                                <a href='/schedule/delete/${schedule.name}'><button type='button'class='btn btn-danger'>Delete</button></a>`;
            schedule.enabled ? 'Yes' : 'No'; // TODO: Fix yes/no doesn't get set
        });
    }
    res.send({ data: { schedules: list } });
});

router.post('/schedule/new', function(req, res) {
    var data = req.body;
    var result = ScheduleManager.create(
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

router.post('/schedule/edit/:name', function(req, res) {
    var data = req.body;
    var oldName = req.params.name;
    var name = data.name;
    var config = data.config;
    var uuids = data.devices;
    var startTime = data.start_time;
    var endTime = data.end_time;
    var timezone = data.timezone;
    var nextConfig = data.next_config;
    var enabled = data.enabled === 'on' ? 1 : 0;
    var result = ScheduleManager.update(oldName, name, config, uuids, startTime, endTime, timezone, nextConfig, enabled);
    if (result) {
        console.log('Schedule', name, 'updated');
    } else {
        console.error('Failed to update schedule', oldName);
    }
    res.redirect('/schedules');
});

router.post('/schedule/delete/:name', function(req, res) {
    var name = req.params.name;
    var result = ScheduleManager.delete(name);
    if (result) {
        // Success
        console.log('Schedule', name, 'deleted');
    }
    res.redirect('/schedules');
});

router.get('/schedule/delete_all', function(req, res) {
    var result = ScheduleManager.deleteAll();
    if (result) {
        // Success
        console.log('All schedules deleted');
    }
    res.redirect('/schedules');
});


// Logging API requests
router.get('/logs/delete_all', function(req, res) {
    var result = Log.deleteAll();
    if (result) {
        // Success
    }
    res.redirect('/settings');
});

router.get('/logs/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var logs = await Log.getByDevice(uuid);
    res.send({
        uuid: uuid,
        data: {
            logs: logs || []
        }
    });
});

router.post('/log/new', async function(req, res) {
    if (!config.logging.enabled) {
        // Logs are disabled
        res.send('OK');
        return;
    }

    // REVIEW: Update device last_seen?
    var uuid = req.body.uuid;
    var messages = req.body.messages;
    if (messages) {
        for (var i = messages.length - 1; i >= 0; i--) {
            logger(uuid).info(messages[i]);
            //console.log('[SYSLOG]', messages[i]);
        }
    }
    res.send('OK');
});

router.get('/log/delete/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var result = await Log.delete(uuid);
    if (result) {
        // Success
    }
    res.redirect('/device/logs/' + uuid);
});

router.get('/log/export/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var logText = '';
    var logs = await Log.getByDevice(uuid);
    if (logs) {
        logs.forEach(function(log) {
            logText += `${log.timestamp} ${log.uuid} ${log.message}\n`;
        });
    }
    res.send(logText);
});

async function get(uuid, url) {
    var isScreen = url.includes('/screen');
    if (isScreen) {
        var screenshotFile = path.resolve(__dirname, '../../screenshots/' + uuid + '.png');
        var fileStream = fs.createWriteStream(screenshotFile);
        request
            .get(url)
            .on('error', function(err) {
                console.error('Failed to get screenshot for', uuid, 'at', url, 'Are you sure the device is up?', err.code);
            })
            .pipe(fileStream);
    } else {
        request.get(url, function(err) {
            if (err) {
                console.error('Error:', err);
            }
        }).on('error', function(err) {
            console.error('Error occurred:', err);
        });
    }
}

module.exports = router;