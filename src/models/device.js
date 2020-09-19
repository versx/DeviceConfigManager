'use strict';

const query = require('../services/db.js');

class Device {
    constructor(uuid, model, config, lastSeen, clientip, iosVersion, ipaVersion, webserverPort = 8080, notes = null, excludeReboots = false, enabled = false) {
        this.uuid = uuid;
        this.model = model;
        this.config = config;
        this.lastSeen = lastSeen;
        this.clientip = clientip;
        this.iosVersion = iosVersion;
        this.ipaVersion = ipaVersion;
        this.webserverPort = webserverPort || 8080;
        this.notes = notes;
        this.excludeReboots = excludeReboots;
        this.enabled = enabled;
    }
    static async getAll() {
        const sql = `
        SELECT uuid, model, config, last_seen, clientip, ios_version, ipa_version, webserver_port, notes, exclude_reboots, enabled
        FROM devices
        `;
        const devices = await query(sql);
        return devices;
    }
    static async getByName(uuid) {
        const sql = `
        SELECT uuid, model, config, last_seen, clientip, ios_version, ipa_version, webserver_port, notes, exclude_reboots, enabled
        FROM devices
        WHERE uuid = ?`;
        const args = [uuid];
        const results = await query(sql, args);
        if (results.length === 0) {
            return null;
        }
        const result = results[0];
        return new Device(
            result.uuid,
            result.model,
            result.config,
            result.last_seen,
            result.clientip,
            result.ios_version,
            result.ipa_version,
            result.webserver_port,
            result.notes,
            result.exclude_reboots,
            result.enabled
        );
    }
    static async create(uuid, model = null, config = null, lastSeen = null, clientip = null, iosVersion = null, ipaVersion = null, webserverPort = 8080, notes = null, excludeReboots = false, enabled = true) {
        const sql = `
        INSERT INTO devices (uuid, model, config, last_seen, clientip, ios_version, ipa_version, webserver_port, notes, exclude_reboots, enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const args = [uuid, model, config, lastSeen, clientip, iosVersion, ipaVersion, webserverPort, notes, excludeReboots, enabled];
        const result = await query(sql, args);
        if (result.affectedRows === 1) {
            return new Device(
                uuid,
                model,
                config,
                lastSeen,
                clientip,
                iosVersion,
                ipaVersion,
                webserverPort,
                notes,
                excludeReboots,
                enabled
            );
        }
        return null;
    }
    static async delete(uuid) {
        const sql = 'DELETE FROM devices WHERE uuid = ?';
        const args = [uuid];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async clearIPAddresses() {
        const sql = 'UPDATE devices SET clientip = NULL';
        const result = await query(sql);
        return result.affectedRows > 0;
    }
    async save() {
        const sql = `
        UPDATE devices
        SET model = ?, config = ?, last_seen = ?, clientip = ?, ios_version = ?, ipa_version = ?, webserver_port = ?, notes = ?, exclude_reboots = ?, enabled = ?
        WHERE uuid = ?`;
        const args = [this.model, this.config, this.lastSeen, this.clientip, this.iosVersion, this.ipaVersion, this.webserverPort, this.notes, this.excludeReboots, this.enabled, this.uuid];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Device;
