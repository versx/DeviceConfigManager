'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mustacheExpress = require('mustache-express');
const config = require('./config.json');
const query = require('./db.js');
const utils = require('./utils.js');
const Device = require('./models/device.js');
const Config = require('./models/config.js');
const Log = require('./models/log.js');
const Migrator = require('./migrator.js');

// TODO: Create route classes
// TODO: Error checking/handling
// TODO: Security / token auth / users (maybe?) or basic authentication

// Start database migrator
var dbMigrator = new Migrator();
dbMigrator.load();

// Middleware
app.set('view engine', 'mustache');
app.set('views', path.resolve(__dirname, 'views'));
app.engine('mustache', mustacheExpress());
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.resolve(__dirname, '../static')));

const defaultData = {
    title: config.title,
    locale: config.locale,
    style: config.style == 'dark' ? 'dark' : '',
    logging: config.logging
};

//app.use('/', require('./routes/devices.js'));

// UI Routes
app.get(['/', '/index'], async function(req, res) {
    var devices = await Device.getAll();
    var configs = await Config.getAll();
    var metadata = await Migrator.getEntries();
    var data = defaultData;
    data.metadata = metadata;
    data.devices = devices.length;
    data.configs = configs.length;
    res.render('index', data);
});

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
    defaultData.uuid = req.params.uuid;
    res.render('device-delete', defaultData);
});

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
    defaultData.name = req.params.name;
    res.render('config-delete', defaultData);
});

app.get('/settings', function(req, res) {
    res.render('settings', defaultData);
});


// Device API Routes
app.get('/api/devices', async function(req, res) {
    try {
        var devices = await Device.getAll();
        devices.forEach(function(device) {
            device.last_seen = utils.getDateTime(device.last_seen);
            device.buttons = `<a href='/config/assign/${device.uuid}'><button type='button' class='btn btn-primary'>Assign</button></a>
							  <a href='/device/logs/${device.uuid}'><button type='button' class='btn btn-info'>Logs</button></a>
                              <a href='/device/delete/${device.uuid}'><button type='button' class='btn btn-danger'>Delete</button></a>`;
        });
        var json = JSON.stringify({ data: { devices: devices } });
        res.send(json);
    } catch (e) {
        console.error('Devices error:', e);
    }
});

app.post('/api/device/new', async function(req, res) {
    var uuid = req.body.uuid;
    var config = req.body.config;
    var result = await Device.create(uuid, config || null, null);
    if (result) {
        // Success
    }
    console.log('New device result:', result);
    res.redirect('/devices');
});

app.post('/api/device/delete/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var result = await Device.delete(uuid);
    if (result) {
        // Success
    }
    res.redirect('/devices');
});


// Config API requests
app.get('/api/configs', async function(req, res) {
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

app.get('/api/config/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var device = await Device.getByName(uuid);
    var noConfig = false;
    // Check if device config is empty, if not provide it as json response
    if (device) {
        // Device exists
        device.lastSeen = new Date() / 1000;
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
        var result = await Device.create(uuid); // REVIEW: Maybe return Device object upon creation to prevent another sql call to get Device object?
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

app.post('/api/config/assign/:uuid', async function(req, res) {
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

app.post('/api/config/new', async function(req, res) {
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

app.post('/api/config/edit/:name', async function(req, res) {
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
        if (c.isDefault !== false) {
            await Config.setDefault(oldName);
        }
    }
    res.redirect('/configs');
});

app.post('/api/config/delete/:name', async function(req, res) {
    var name = req.params.name;
    var result = await Config.delete(name);
    if (result) {
        // Success
    }
    res.redirect('/configs');
});


// Log API requests
app.get('/api/logs/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var data = defaultData;
    data.uuid = uuid;
    var logs = await Log.getByDevice(uuid);
    data.data = {
        logs: logs || []
    };
    res.send(data);
});

app.post('/api/log/new/:uuid', async function(req, res) {
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

app.get('/api/log/delete/:uuid', async function(req, res) {
    var uuid = req.params.uuid;
    var result = await Log.delete(uuid);
    if (result) {
        // Success
    }
    res.redirect('/device/logs/' + uuid);
});

app.get('/api/logs/delete_all', async function(req, res) {
    var result = await Log.deleteAll();
    if (result) {
        // Success
    }
    res.redirect('/logs');
});

app.listen(config.port, config.interface, () => console.log(`Listening on port ${config.port}...`));