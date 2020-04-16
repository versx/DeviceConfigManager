"use strict"

const query = require('../db.js');

class Config {
    constructor(name, backendUrl) {
        this.name = name;
        this.backendUrl = backendUrl;
    }
    static async getAll() {
        var configs = await query("SELECT * FROM config");
        return configs;
    }
    static async create(name, backendUrl) {
        var sql = "INSERT INTO config (name, backend_url) VALUES (?, ?)";
        var args = [name, backendUrl];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async delete(name) {
        var sql = "DELETE FROM config WHERE name = ?";
        var args = [name];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    async save(oldName) {
        var sql = "UPDATE config SET name = ? WHERE name = ?";
        var args = [this.name, oldName];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Config;