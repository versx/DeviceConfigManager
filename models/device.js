"use strict"

const query = require('../db.js');

class Device {
    constructor(uuid, config) {
        this.uuid = uuid;
        this.config = config;
    }
    static async getAll() {
        var devices = await query("SELECT * FROM device");
        return devices;
    }
    static async getByName(uuid) {
        var sql = "SELECT uuid, config FROM device WHERE uuid = ?";
        var args = [uuid];
        var result = await query(sql, args);
        return result[0];
    }
    static async create(uuid, config = null) {
        var sql = "INSERT INTO device (uuid, config) VALUES (?, ?)";
        var args = [uuid, config];
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
        var sql = "UPDATE device SET config = ? WHERE uuid = ?";
        var args = [this.config, this.uuid];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Device;