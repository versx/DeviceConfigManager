'use strict';

const query = require('../db.js');

class Device {
    constructor(uuid, config, lastSeen, clientip, iosVersion, ipaVersion) {
        this.uuid = uuid;
        this.config = config;
        this.lastSeen = lastSeen;
        this.clientip = clientip;
        this.iosVersion = iosVersion;
        this.ipaVersion = ipaVersion;
    }
    static async getAll() {
        const devices = await query('SELECT uuid, config, last_seen, clientip, ios_version, ipa_version FROM devices');
        return devices;
    }
    static async getByName(uuid) {
        const sql = `
        SELECT uuid, config, last_seen, clientip, ios_version, ipa_version
        FROM devices
        WHERE uuid = ?`;
        const args = [uuid];
        const result = await query(sql, args);
        if (result.length === 0) {
            return null;
        }
        return new Device(
            result[0].uuid,
            result[0].config,
            result[0].last_seen,
            result[0].clientip,
            result[0].ios_version,
            result[0].ipa_version
        );
    }
    static async create(uuid, config = null, lastSeen = null, clientip = null, iosVersion = null, ipaVersion = null) {
        const sql = `
        INSERT INTO devices (uuid, config, last_seen, clientip, ios_version, ipa_version)
        VALUES (?, ?, ?, ?, ?, ?)`;
        const args = [uuid, config, lastSeen, clientip, iosVersion, ipaVersion];
        const result = await query(sql, args);
        if (result.affectedRows === 1) {
            return new Device(
                uuid,
                config,
                lastSeen,
                clientip,
                iosVersion,
                ipaVersion
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
    async save() {
        const sql = `
        UPDATE devices
        SET config = ?, last_seen = ?, clientip = ?, ios_version = ?, ipa_version = ?
        WHERE uuid = ?`;
        const args = [this.config, this.lastSeen, this.clientip, this.iosVersion, this.ipaVersion, this.uuid];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Device;