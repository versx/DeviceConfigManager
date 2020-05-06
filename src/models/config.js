'use strict';

const query = require('../db.js');

class Config {
    constructor(name, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
        accountManager, deployEggs, nearbyTracker, autoLogin, isDefault) {
        this.name = name;
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
        const configs = await query('SELECT * FROM configs');
        return configs;
    }
    static async getByName(name) {
        const sql = `
        SELECT backend_url, data_endpoints, token, heartbeat_max_time, min_delay_logout,
               account_manager, deploy_eggs, nearby_tracker, auto_login, is_default
        FROM configs
        WHERE name = ?
        LIMIT 1`;
        const args = [name];
        const result = await query(sql, args);
        if (result.length === 0) {
            return null;
        }
        const [c] = result;
        const data = new Config(
            name,
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
    static async create(name, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
        accountManager, deployEggs, nearbyTracker, autoLogin, isDefault) {
        const sql = `
        INSERT INTO configs (name, backend_url, data_endpoints, token, heartbeat_max_time, min_delay_logout,
                            account_manager, deploy_eggs, nearby_tracker, auto_login, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const args = [name, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
            accountManager, deployEggs, nearbyTracker, autoLogin, isDefault];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async delete(name) {
        const sql = 'DELETE FROM configs WHERE name = ?';
        const args = [name];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getDefault() {
        const sql = `
        SELECT name, backend_url, data_endpoints, token, heartbeat_max_time, min_delay_logout,
               account_manager, deploy_eggs, nearby_tracker, auto_login, is_default
        FROM configs
        WHERE is_default = 1
        LIMIT 1`;
        const result = await query(sql, []);
        if (result.length === 0) {
            return null;
        }
        const c = result[0];
        const data = new Config(
            c.name,
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
        const sql = `
        UPDATE dcm.configs
        SET is_default = IF(name = ?, 1, 0);`;
        const args = [name];
        const result = await query(sql, args);
        return result.affectedRows > 0;
    }
    async save(oldName) {
        const sql = `
        UPDATE configs
        SET name=?, backend_url=?, data_endpoints=?, token=?, heartbeat_max_time=?, min_delay_logout=?,
            account_manager=?, deploy_eggs=?, nearby_tracker=?, auto_login=?, is_default=?
        WHERE name=?`;
        const args = [
            this.name,
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
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Config;