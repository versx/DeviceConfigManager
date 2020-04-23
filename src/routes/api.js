'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../config.json');
const query = require('../db.js');
const utils = require('../utils.js');
const upload = multer({ dest: '../../screenshots' });

const Account = require('../models/account.js');
const Config = require('../models/config.js');
const Device = require('../models/device.js');
const Log = require('../models/log.js');


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


// Device API Routes
router.get('/devices', async function(req, res) {
    try {
        var devices = await Device.getAll();
        devices.forEach(function(device) {
            var screenshot = `/screenshots/${device.uuid}.png`;
            var exists = fs.existsSync(path.join(__dirname, `..${screenshot}`));
            var image = exists ? screenshot : '/img/offline.png';
            device.image = `<a href='${image}' target='_blank'><img src='${image}' width='64' height='96'/></a>`;
            device.last_seen = utils.getDateTime(device.last_seen);
            device.buttons = `
            <div class='btn-group'>
                <button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>Action</button>
                <div class='dropdown-menu'>
                    <a href='/device/manage/${device.uuid}' class='dropdown-item btn-success'>Manage</a>
                    <a href='/config/assign/${device.uuid}' class='dropdown-item btn-secondary'>Assign Config</a>
                    <a href='/device/logs/${device.uuid}' class='dropdown-item btn-secondary'>View Logs</a>
                    <div class='dropdown-divider'></div>
                    <a href='/device/delete/${device.uuid}' class='dropdown-item btn-danger'>Delete</a>
                </div>
            </div>`;
        });
        var json = JSON.stringify({ data: { devices: devices } });
        res.send(json);
    } catch (e) {
        console.error('Devices error:', e);
    }
});

router.post('/device/new', async function(req, res) {
    var uuid = req.body.uuid;
    var config = req.body.config || null;
    var clientip = req.body.clientip || null;
    var result = await Device.create(uuid, config, null, clientip);
    if (result) {
        // Success
    }
    console.log('New device result:', result);
    res.redirect('/devices');
});

router.post('/device/:uuid/screen', upload.single('file'), function(req, res) {
    var uuid = req.params.uuid;
    var fileName = uuid + '.png';
    const tempPath = req.file.path;
    const screenshotsDir = path.resolve(__dirname, '../screenshots');
    const targetPath = path.join(screenshotsDir, fileName);
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }
    //console.log("File:", req.file);
    //console.log("Temp Path:", tempPath, "Target Path:", targetPath, "Original FileName:", req.file.originalname);
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

router.get('/config/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var device = await Device.getByName(uuid);
    var noConfig = false;
    // Check for a proxied IP before the normal IP and set the first one at exists
    var clientip = ((req.headers['x-forwarded-for'] || '').split(', ')[0]) || (req.connection.remoteAddress).match('[0-9]+.[0-9].+[0-9]+.[0-9]+$')[0];
    
    // Check if device config is empty, if not provide it as json response
    if (device) {
        // Device exists
        device.lastSeen = new Date() / 1000;
        device.clientip = clientip;
        device.save();
        if (device.config) {
            // Do something
        } else {
            console.log('Device', uuid, 'not assigned a config, attempting to assign the default config if one is set...');
            // Not assigned a config
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
    } else {
        console.log('Device does not exist, creating...');
        // Device doesn't exist, create db entry
        var result = await Device.create(uuid, null, new Date() / 1000, clientip); // REVIEW: Maybe return Device object upon creation to prevent another sql call to get Device object?
        if (result) {
            // Success, assign default config if there is one.
            var defaultConfig = await Config.getDefault();
            if (defaultConfig !== null) {
                console.log('Assigning device', uuid, 'default config', defaultConfig.name);
                device = await Device.getByName(uuid);
                device.config = defaultConfig.name;
                device.save();
            } else {
                // No default config so don't give config response
                noConfig = true;
            }
        } else {
            // Failed to create device so don't give config response
            noConfig = true;
        }
    }

    if (noConfig) {
        console.error('No config assigned to device', uuid, 'and no default config to assign!');
        var data = {
            status: 'error',
            error: 'Device not assigned to config!'
        };
        var json = JSON.stringify(data);
        res.send(json);
        return;
    }
    
    var c = await Config.getByName(device.config);
    if (c === null) {
        console.error('Failed to grab config', device.config);
        var data = {
            status: 'error',
            error: 'Device not assigned to config!'
        };
        var json = JSON.stringify(data);
        res.send(json);
        return;
    }
    // Build json config
    var json = utils.buildConfig(
        c.backendUrl,
        c.port,
        c.heartbeatMaxTime,
        c.pokemonMaxTime,
        c.raidMaxTime,
        c.startupLat,
        c.startupLon,
        c.token,
        c.jitterValue,
        c.maxWarningTimeRaid,
        c.encounterDelay,
        c.minDelayLogout,
        c.maxEmptyGmo,
        c.maxFailedCount,
        c.maxNoQuestCount,
        c.loggingUrl,
        c.loggingPort,
        c.loggingTls,
        c.loggingTcp,
        c.accountManager,
        c.deployEggs,
        c.nearbyTracker,
        c.autoLogin,
        c.ultraIV,
        c.ultraQuests,
        c.isDefault
    );
    console.log('Config response:', json);
    res.send(json);
});

router.post('/config/assign/:uuid', async function(req, res) {
    // TODO: Device.getByName and Device.assignConfig(name)
    var uuid = req.params.uuid;
    var config = req.body.config;
    var sql = 'UPDATE devices SET config = ? WHERE uuid = ?';
    var args = [config, uuid];
    var result = await query(sql, args);
    if (result.affectedRows === 1) {
        // Success
    }
    res.redirect('/devices');
});

router.post('/config/new', async function(req, res) {
    var data = req.body;
    var result = await Config.create(
        data.name,
        data.backend_url,
        data.port,
        data.heartbeat_max_time,
        data.pokemon_max_time,
        data.raid_max_time,
        data.startup_lat,
        data.startup_lon,
        data.token,
        data.jitter_value,
        data.max_warning_time_raid,
        data.encounter_delay,
        data.min_delay_logout,
        data.max_empty_gmo,
        data.max_failed_count,
        data.max_no_quest_count,
        data.logging_url,
        data.logging_port,
        data.logging_tls === 'on' ? 1 : 0,
        data.logging_tcp === 'on' ? 1 : 0,
        data.account_manager === 'on' ? 1 : 0,
        data.deploy_eggs === 'on' ? 1 : 0,
        data.nearby_tracker === 'on' ? 1 : 0,
        data.auto_login === 'on' ? 1 : 0,
        data.ultra_iv === 'on' ? 1 : 0,
        data.ultra_quests === 'on' ? 1 : 0,
        data.is_default === 'on' ? 1 : 0
    );
    if (result) {
        console.log('Config inserted');
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
    c.backendUrl = data.backend_url;
    c.port = data.port;
    c.heartbeatMaxTime = data.heartbeat_max_time;
    c.pokemonMaxTime = data.pokemon_max_time;
    c.raidMaxTime = data.raid_max_time;
    c.startupLat = data.startup_lat;
    c.startupLon = data.startup_lon;
    c.token = data.token;
    c.jitterValue = data.jitter_value;
    c.maxWarningTimeRaid = data.max_warning_time_raid;
    c.encounterDelay = data.encounter_delay;
    c.minDelayLogout = data.min_delay_logout;
    c.maxEmptyGmo = data.max_empty_gmo;
    c.maxFailedCount = data.max_failed_count;
    c.maxNoQuestCount = data.max_no_quest_count;
    c.loggingUrl = data.logging_url;
    c.loggingPort = data.logging_port;
    c.loggingTls = data.logging_tls === 'on' ? 1 : 0;
    c.loggingTcp = data.logging_tcp === 'on' ? 1 : 0;
    c.accountManager = data.account_manager === 'on' ? 1 : 0;
    c.deployEggs = data.deploy_eggs === 'on' ? 1 : 0;
    c.nearbyTracker = data.nearby_tracker === 'on' ? 1 : 0;
    c.autoLogin = data.auto_login === 'on' ? 1 : 0;
    c.ultraIV = data.ultra_iv === 'on' ? 1 : 0;
    c.ultraQuests = data.ultra_quests === 'on' ? 1 : 0;
    c.isDefault = data.is_default === 'on' ? 1 : 0;
    if (await c.save(oldName)) {
        // Success
        if (c.isDefault) {
            await Config.setDefault(oldName);
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


// Logging API requests
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

router.post('/log/new/:uuid', async function(req, res) {
    if (config.logging === false) {
        // Logs are disabled
        res.send('OK');
        return;
    }
    var uuid = req.params.uuid;
    var msg = Object.keys(req.body)[0]; // Dumb hack
    var result = await Log.create(uuid, msg);
    if (result) {
        // Success
    }
    console.log('[SYSLOG]', uuid, ':', msg);
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

router.get('/logs/delete_all', async function(req, res) {
    var result = await Log.deleteAll();
    if (result) {
        // Success
    }
    res.redirect('/logs');
});

module.exports = router;