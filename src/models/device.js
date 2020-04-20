'use strict';

const query = require('../db.js');

class Device {
    constructor(uuid, config, lastSeen, clientip) {
        this.uuid = uuid;
        this.config = config;
        this.lastSeen = lastSeen;
        this.clientip = clientip;
    }
    static async getAll() {
        var devices = await query("SELECT uuid, config, last_seen, clientip FROM devices");
        return devices;
    }
    static async getByName(uuid) {
        var sql = `
        SELECT uuid, config, last_seen, clientip
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
            result[0].clientip
        );
    }
    static async create(uuid, config = null, lastSeen = null, clientip) {
        var sql = `
        INSERT INTO devices (uuid, config, last_seen, clientip)
        VALUES (?, ?, ?, ?)`;
        var args = [uuid, config, lastSeen, clientip];
        var result = await query(sql, args);
        return result.affectedRows === 1;
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
        SET config = ?, last_seen = ?, clientip = ?
        WHERE uuid = ?`;
        var args = [this.config, this.lastSeen, this.clientip, this.uuid];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Device;