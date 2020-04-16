"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mustacheExpress = require('mustache-express');
const port = 9991;

// TODO: Create routes class


// Fake models for now
const devices = [{
	uuid: "iPhone1",
	config: "test",
	host: "127.0.0.1",
	buttons: "<a href='/config/assign/iPhone1'><button type='button' class='btn btn-primary'>Assign Config</button></a>"
}];

const configs = [{
	name: "Test config",
	backend: "http://10.0.1.100:9001",
	buttons: "<a href='/config/edit/Test config'><button type='button' class='btn btn-primary' data-toggle='modal' data-target='#editConfigModal'>Edit</button></a> \
              <a href='/config/delete/Test config'><button type='button'class='btn btn-danger' data-toggle='modal' data-target='#deleteConfigModal'>Delete</button></a>"
}];

// Middleware
app.set('view engine', 'mustache');
app.set('views', './views');
app.engine("mustache", mustacheExpress());
//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies
//app.use(bodyParser.raw({ type: 'application/x-www-form-urlencoded' }));
//app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname + '/public'));

// Routes
//app.use('/', express.static('public'));

app.get(['/', '/index'], function(req, res) {
	var data = {
		title: "Tester"
	};
    res.render('index', data);
});

app.get('/configs', function(req, res) {
	var data = {
		title: "Tester"
	};
    res.render('configs', data);
});

app.get('/devices', function(req, res) {
	var data = {
		title: "Tester"
	};
    res.render('devices', data);
});

app.get('/config/assign/:uuid', function(req, res) {
	var data = {
		title: "Tester",
		configs: configs,
		device: req.params.uuid
	};
    res.render('config-assign', data);
});

app.get('/config/new', function(req, res) {
	var data = {
		title: "Tester"
	};
    res.render('config-new', data);
});

app.get('/config/edit/:name', function(req, res) {
	var data = {
		title: "Tester"
	};
    res.render('config-edit', data);
});

app.get('/config/delete/:name', function(req, res) {
	var data = {
		title: "Tester"
	};
    res.render('config-delete', data);
});

app.get('/api/get_config/:uuid', function(req, res) {
	var uuid = req.params.uuid;
	console.log("Get config:", uuid);
	// TODO: Send config for provided uuid
	res.send('OK');
});

app.get('/api/get_devices', function(req, res) {
	var data = {
		data: {
			devices: devices
		}
	};
	var json = JSON.stringify(data);
	console.log("Devices:", json);
	res.send(json);
});

app.get('/api/get_configs', function(req, res) {
	var data = {
		data: {
			configs: configs
		}
	};
	var json = JSON.stringify(data);
	console.log("Configs:", json);
	res.send(json);
});

app.post('/api/assign/:uuid', function(req, res) {
	var uuid = req.params.uuid;
	var config = req.body.config;
	console.log("Assign:", uuid, "Config:", config);
	res.redirect('/devices');
});

app.post('/api/edit/:uuid', function(req, res) {
	res.send('OK');
});

app.post('/api/delete/:uuid', function(req, res) {
	res.send('OK');
});

app.listen(port, () => console.log(`Listening on port ${port}...`));

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