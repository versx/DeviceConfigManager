"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mustacheExpress = require('mustache-express');
const config = require('./config.json');
const db = require('./db.js');

// TODO: Create routes class
// TODO: Create Config and Device models
// TODO: Promisify mysql query

// Middleware
app.set('view engine', 'mustache');
app.set('views', './views');
app.engine("mustache", mustacheExpress());
//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies
//app.use(bodyParser.raw({ type: 'application/x-www-form-urlencoded' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
//app.use(bodyParser.json({ limit: '50mb' }));

// Routes
app.get(['/', '/index'], function(req, res) {
    var data = {
        title: config.title
    };
    res.render('index', data);
});

app.get('/configs', function(req, res) {
    var data = {
        title: config.title
    };
    res.render('configs', data);
});

app.get('/devices', function(req, res) {
    var data = {
        title: config.title
    };
    res.render('devices', data);
});

app.get('/config/assign/:uuid', function(req, res) {
    var data = {
        title: config.title,
        configs: configs,
        device: req.params.uuid
    };
    res.render('config-assign', data);
});

app.get('/config/new', function(req, res) {
    var data = {
        title: config.title
    };
    res.render('config-new', data);
});

app.get('/config/edit/:name', function(req, res) {
	var name = req.params.name;
	var sql = "SELECT backend_url, port, heartbeat_max_time, pokemon_max_time, raid_max_time, startup_lat, startup_lon, token, jitter_value, max_warning_time_raid, encounter_delay, min_delay_logout, max_empty_gmo, max_failed_count, max_no_quests_count, logging_url, logging_port, logging_tls, logging_tcp, account_manager, deploy_eggs, nearby_tracker, auto_login, ultra_iv, ultra_quests FROM config WHERE name=? LIMIT 1";
	var args = [name];
	db.query(sql, args, function(err, result) {
		if (err) throw err;
		result.forEach(function(c) {
			var data = {
				title: config.title,
				name: name,
				backend_url: c.backend_url,
				port: c.port,
				heartbeat_max_time: c.heartbeat_max_time,
				pokemon_max_time: c.pokemon_max_time,
				raid_max_time: c.raid_max_time,
				startup_lat: c.startup_lat,
				startup_lon: c.startup_lon,
				token: c.token,
				jitter_value: c.jitter_value,
				max_warning_time_raid: c.max_warning_time_raid,
				encounter_delay: c.encounter_delay,
				min_delay_logout: c.min_delay_logout,
				max_empty_gmo: c.max_empty_gmo,
				max_failed_count: c.max_failed_count,
				max_no_quests_count: c.max_no_quests_count,
				logging_url: c.logging_url,
				logging_port: c.logging_port,
				logging_tls: c.logging_tls == 1 ? "checked" : "",
				logging_tcp: c.logging_tcp == 1 ? "checked" : "",
				account_manager: c.account_manager == 1 ? "checked" : "",
				deploy_eggs: c.deploy_eggs == 1 ? "checked" : "",
				nearby_tracker: c.nearby_tracker == 1 ? "checked" : "",
				auto_login: c.auto_login == 1 ? "checked" : "",
				ultra_iv: c.ultra_iv == 1 ? "checked" : "",
				ultra_quests: c.ultra_quests == 1 ? "checked" : ""
			};
			res.render('config-edit', data);
		});
	});
});

app.get('/config/delete/:name', function(req, res) {
    var data = {
        title: config.title
    };
    res.render('config-delete', data);
});



app.get('/api/devices', function(req, res) {
	db.query("SELECT * FROM device", function(err, result) {
		if (err) throw err;
		var devices = [];
		result.forEach(function(device) {
			devices.push({
				uuid: device.uuid,
				config: device.config || "Test config",
				buttons: "<a href='/config/assign/" + device.uuid + "'><button type='button' class='btn btn-primary'>Assign Config</button></a>"
			});
		});
		var json = JSON.stringify({ data: { devices: devices } });
		res.send(json);
	});
});

app.get('/api/configs', function(req, res) {
	try {
		db.query("SELECT * FROM config", function(err, result) {
			if (err) throw err;
			var configs = [];
			result.forEach(function(config) {
				configs.push({
					name: config.name,
					backend_url: config.backend_url || "N/A",
					buttons: "<a href='/config/edit/" + config.name + "'><button type='button' class='btn btn-primary' data-toggle='modal' data-target='#editConfigModal'>Edit</button></a> \
							<a href='/config/delete/" + config.name + "'><button type='button'class='btn btn-danger' data-toggle='modal' data-target='#deleteConfigModal'>Delete</button></a>"
				});
			});
			var json = JSON.stringify({ data: { configs: configs } });
			res.send(json);
		});
    } catch (e) {
		console.log("Configs error:", e);
	}
});

app.get('/api/config/:uuid', function(req, res) {
    var uuid = req.params.uuid;
	console.log("Get config:", uuid);
	// TODO: If device doesn't exist create db entry and return error response, otherwise send config for provided uuid.
    res.send('OK');
});

app.post('/api/config/assign/:uuid', function(req, res) {
    var uuid = req.params.uuid;
    var config = req.body.config;
    console.log("Assign:", uuid, "Config:", config);
    res.redirect('/devices');
});

app.post('/api/config/new', function(req, res) {
	var sql = "INSERT INTO config (name, backend_url, port, heartbeat_max_time, pokemon_max_time, raid_max_time, startup_lat, startup_lon, token, jitter_value, max_warning_time_raid, encounter_delay, min_delay_logout, max_empty_gmo, max_failed_count, max_no_quests_count, logging_url, logging_port, logging_tls, logging_tcp, account_manager, deploy_eggs, nearby_tracker, auto_login, ultra_iv, ultra_quests)" +
			  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
	var args = [];
	var keys = Object.keys(req.body);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = req.body[key];
		console.log("Key:", key, "Value:", value);
		var booleans = ["logging_tls", "logging_tcp", "account_manager", "deploy_eggs", "nearby_tracker", "auto_login", "ultra_iv", "ultra_quests"];
		if (booleans.includes(key)) {
			args.push(value === 'on' ? 1 : 0);
		} else {
			args.push(value);
		}
	}
	db.query(sql, args, function(err, result) {
		if (err) throw err;
		console.log("Config inserted");
		res.redirect('/configs');
	});
});

app.post('/api/config/edit/:name', function(req, res) {
	var oldName = req.params.name;
	console.log("Old name:", oldName);
	var sql = "UPDATE device SET name=?, backend_url=?, port=?, heartbeat_max_time=?, pokemon_max_time=?, raid_max_time=?, startup_lat=?, startup_lon=?, token=?, jitter_value=?, max_warning_time_raid=?, encounter_delay=?, min_delay_logout=?, max_empty_gmo=?, max_failed_count=?, max_no_quests_count=?, logging_url=?, logging_port=?, logging_tls=?, logging_tcp=?, account_manager=?, deploy_eggs=?, nearby_tracker=?, auto_login=?, ultra_iv=?, ultra_quests=? WHERE name=?";
    res.send('OK');
});

app.post('/api/config/delete/:name', function(req, res) {
    res.send('OK');
});

app.listen(config.port, () => console.log(`Listening on port ${config.port}...`));


/**
 * Device connects, if it isn't in db create it, error out in kevin with device config not assigned message.
 * 
 * Dashboard Page
 * - Device Count?
 * - Config Count?
 * 
 * Device Page
 * - Add device manually
 * - Assign Config
 * - Edit Device (Optional)
 * - Delete Device
 * 
 * Config Page
 * - Add
 * - Edit
 * - Delete
 * 
 * Settings Page
 */