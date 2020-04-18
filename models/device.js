"use strict"

const query = require('../db.js');

class Device {
    constructor(uuid, config, lastSeen) {
        this.uuid = uuid;
        this.config = config;
        this.lastSeen = lastSeen;
    }
    static async getAll() {
        var devices = await query("SELECT uuid, config, last_seen FROM device");
        return devices;
    }
    static async getByName(uuid) {
        var sql = `
        SELECT uuid, config, last_seen
        FROM device
        WHERE uuid = ?`;
        var args = [uuid];
        var result = await query(sql, args);
        if (result.length === 0) {
            return null;
        }
        return new Device(
            result[0].uuid,
            result[0].config,
            result[0].last_seen
        );
    }
    static async create(uuid, config = null, lastSeen = null) {
        var sql = `
        INSERT INTO device (uuid, config, last_seen)
        VALUES (?, ?, ?)`;
        var args = [uuid, config, lastSeen];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async delete(uuid) {
        var sql = "DELETE FROM device WHERE uuid = ?";
        var args = [uuid];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    async save() {
        var sql = `
        UPDATE device
        SET config = ?, last_seen = ?
        WHERE uuid = ?`;
        var args = [this.config, this.lastSeen, this.uuid];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Device;