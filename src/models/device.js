'use strict';

const query = require('../services/db.js');

class Device {
    constructor(uuid, config, lastSeen, clientip, iosVersion, ipaVersion, notes = null) {
        this.uuid = uuid;
        this.config = config;
        this.lastSeen = lastSeen;
        this.clientip = clientip;
        this.iosVersion = iosVersion;
        this.ipaVersion = ipaVersion;
        this.notes = notes;
    }
    static async getAll() {
        var devices = await query('SELECT uuid, config, last_seen, clientip, ios_version, ipa_version, notes FROM devices');
        return devices;
    }
    static async getByName(uuid) {
        var sql = `
        SELECT uuid, config, last_seen, clientip, ios_version, ipa_version, notes
        FROM devices
        WHERE uuid = ?`;
        var args = [uuid];
        var result = await query(sql, args);
        if (result.length === 0) {
            return null;
        }
        return new Device(
            result[0].uuid,
            result[0].config,
            result[0].last_seen,
            result[0].clientip,
            result[0].ios_version,
            result[0].ipa_version,
            result[0].notes
        );
    }
    static async create(uuid, config = null, lastSeen = null, clientip = null, iosVersion = null, ipaVersion = null, notes = null) {
        var sql = `
        INSERT INTO devices (uuid, config, last_seen, clientip, ios_version, ipa_version, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
        var args = [uuid, config, lastSeen, clientip, iosVersion, ipaVersion, notes];
        var result = await query(sql, args);
        if (result.affectedRows === 1) {
            return new Device(
                uuid,
                config,
                lastSeen,
                clientip,
                iosVersion,
                ipaVersion,
                notes
            );
        }
        return null;
    }
    static async delete(uuid) {
        var sql = 'DELETE FROM devices WHERE uuid = ?';
        var args = [uuid];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    async save() {
        var sql = `
        UPDATE devices
        SET config = ?, last_seen = ?, clientip = ?, ios_version = ?, ipa_version = ?, notes = ?
        WHERE uuid = ?`;
        var args = [this.config, this.lastSeen, this.clientip, this.iosVersion, this.ipaVersion, this.notes, this.uuid];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Device;