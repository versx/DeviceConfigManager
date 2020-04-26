'use strict';

const query = require('../db.js');

class Config {
    constructor(name, provider, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
        accountManager, deployEggs, nearbyTracker, autoLogin, isDefault) {
        this.name = name;
        this.provider = provider;
        this.backendUrl = backendUrl;
        this.dataEndpoints = dataEndpoints;
        this.token = token;
        this.heartbeatMaxTime = heartbeatMaxTime;
        this.minDelayLogout = minDelayLogout;
        this.accountManager = accountManager;
        this.deployEggs = deployEggs;
        this.nearbyTracker = nearbyTracker;
        this.autoLogin = autoLogin;
        this.isDefault = isDefault;
    }
    static async getAll() {
        var configs = await query('SELECT * FROM configs');
        return configs;
    }
    static async getByName(name) {
        var sql = `
        SELECT backend_url, provider, data_endpoints, token, heartbeat_max_time, min_delay_logout,
               account_manager, deploy_eggs, nearby_tracker, auto_login, is_default
        FROM configs
        WHERE name = ?
        LIMIT 1`;
        var args = [name];
        var result = await query(sql, args);
        if (result.length === 0) {
            return null;
        }
        var c = result[0];
        var data = new Config(
            name,
            c.provider,
            c.backend_url,
            c.data_endpoints,
            c.token,
            c.heartbeat_max_time,
            c.min_delay_logout,
            c.account_manager,
            c.deploy_eggs,
            c.nearby_tracker,
            c.auto_login,
            c.is_default
        );
        return data;
    }
    static async create(name, provider, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
        accountManager, deployEggs, nearbyTracker, autoLogin, isDefault) {
        var sql = `
        INSERT INTO configs (name, provider, backend_url, data_endpoints, token, heartbeat_max_time, min_delay_logout,
                            account_manager, deploy_eggs, nearby_tracker, auto_login, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        var args = [name, provider, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
            accountManager, deployEggs, nearbyTracker, autoLogin, isDefault];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async delete(name) {
        var sql = 'DELETE FROM configs WHERE name = ?';
        var args = [name];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getDefault() {
        var sql = `
        SELECT name, provider, backend_url, data_endpoints, token, heartbeat_max_time, min_delay_logout,
               account_manager, deploy_eggs, nearby_tracker, auto_login, is_default
        FROM configs
        WHERE is_default = 1
        LIMIT 1`;
        var result = await query(sql, []);
        if (result.length === 0) {
            return null;
        }
        var c = result[0];
        var data = new Config(
            c.name,
            c.provider,
            c.backend_url,
            c.data_endpoints,
            c.token,
            c.heartbeat_max_time,
            c.min_delay_logout,
            c.account_manager,
            c.deploy_eggs,
            c.nearby_tracker,
            c.auto_login,
            c.is_default
        );
        return data;
    }
    static async setDefault(name) {
        var sql = `
        UPDATE configs
        SET is_default = IF(name = ?, 1, 0);`;
        var args = [name];
        var result = await query(sql, args);
        return result.affectedRows > 0;
    }
    async save(oldName) {
        var sql = `
        UPDATE configs
        SET name=?, provider=?, backend_url=?, data_endpoints=?, token=?, heartbeat_max_time=?, min_delay_logout=?,
            account_manager=?, deploy_eggs=?, nearby_tracker=?, auto_login=?, is_default=?
        WHERE name=?`;
        var args = [
            this.name,
            this.provider,
            this.backendUrl,
            this.dataEndpoints,
            this.token,
            this.heartbeatMaxTime,
            this.minDelayLogout,
            this.accountManager,
            this.deployEggs,
            this.nearbyTracker,
            this.autoLogin,
            this.isDefault,
            oldName
        ];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Config;