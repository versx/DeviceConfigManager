"use strict"

const query = require('../db.js');

class Config {
    constructor(name, backendUrl, port, heartbeatMaxTime, pokemonMaxTime, raidMaxTime, startupLat, startupLon, token, jitterValue,
                maxWarningTimeRaid, encounterDelay, minDelayLogout, maxEmptyGmo, maxFailedCount, maxNoQuestCount, loggingUrl,
                loggingPort, loggingTls, loggingTcp, accountManager, deployEggs, nearbyTracker, autoLogin, ultraIV, ultraQuests, isDefault) {
        this.name = name;
        this.backendUrl = backendUrl;
        this.port = port;
        this.heartbeatMaxTime = heartbeatMaxTime;
        this.pokemonMaxTime = pokemonMaxTime;
        this.raidMaxTime = raidMaxTime;
        this.startupLat = startupLat;
        this.startupLon = startupLon;
        this.token = token;
        this.jitterValue = jitterValue;
        this.maxWarningTimeRaid = maxWarningTimeRaid;
        this.encounterDelay = encounterDelay;
        this.minDelayLogout = minDelayLogout;
        this.maxEmptyGmo = maxEmptyGmo;
        this.maxFailedCount = maxFailedCount;
        this.maxNoQuestCount = maxNoQuestCount;
        this.loggingUrl = loggingUrl;
        this.loggingPort = loggingPort;
        this.loggingTls = loggingTls;
        this.loggingTcp = loggingTcp;
        this.accountManager = accountManager;
        this.deployEggs = deployEggs;
        this.nearbyTracker = nearbyTracker;
        this.autoLogin = autoLogin;
        this.ultraIV = ultraIV;
        this.ultraQuests = ultraQuests;
        this.isDefault = isDefault;
    }
    static async getAll() {
        var configs = await query("SELECT * FROM configs");
        return configs;
    }
    static async getByName(name) {
        var sql = `
        SELECT backend_url, port, heartbeat_max_time, pokemon_max_time, raid_max_time, startup_lat, startup_lon, token, jitter_value,
               max_warning_time_raid, encounter_delay, min_delay_logout, max_empty_gmo, max_failed_count, max_no_quest_count, logging_url,
               logging_port, logging_tls, logging_tcp, account_manager, deploy_eggs, nearby_tracker, auto_login, ultra_iv, ultra_quests,
               is_default
        FROM configs
        WHERE name = ?
        LIMIT 1`;
        var args = [name];
        var result = await query(sql, args);
        if (result.length === 0) {
            return null;
        }
        // TODO: Error checking
        var c = result[0];
        var data = new Config(
            name,
            c.backend_url,
            c.port,
            c.heartbeat_max_time,
            c.pokemon_max_time,
            c.raid_max_time,
            c.startup_lat,
            c.startup_lon,
            c.token,
            c.jitter_value,
            c.max_warning_time_raid,
            c.encounter_delay,
            c.min_delay_logout,
            c.max_empty_gmo,
            c.max_failed_count,
            c.max_no_quest_count,
            c.logging_url,
            c.logging_port,
            c.logging_tls,
            c.logging_tcp,
            c.account_manager,
            c.deploy_eggs,
            c.nearby_tracker,
            c.auto_login,
            c.ultra_iv,
            c.ultra_quests,
            c.is_default
        );
        return data;
    }
    static async create(name, backendUrl, port, heartbeatMaxTime, pokemonMaxTime, raidMaxTime, startupLat, startupLon, token, jitterValue,
                        maxWarningTimeRaid, encounterDelay, minDelayLogout, maxEmptyGmo, maxFailedCount, maxNoQuestCount, loggingUrl, loggingPort,
                        loggingTls, loggingTcp, accountManager, deployEggs, nearbyTracker, autoLogin, ultraIV, ultraQuests, isDefault) {
        var sql = `
        INSERT INTO configs (name, backend_url, port, heartbeat_max_time, pokemon_max_time, raid_max_time, startup_lat, startup_lon, token, jitter_value,
                            max_warning_time_raid, encounter_delay, min_delay_logout, max_empty_gmo, max_failed_count, max_no_quest_count, logging_url,
                            logging_port, logging_tls, logging_tcp, account_manager, deploy_eggs, nearby_tracker, auto_login, ultra_iv, ultra_quests,
                            is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        var args = [name, backendUrl, port, heartbeatMaxTime, pokemonMaxTime, raidMaxTime, startupLat, startupLon, token, jitterValue,
                    maxWarningTimeRaid, encounterDelay, minDelayLogout, maxEmptyGmo, maxFailedCount, maxNoQuestCount, loggingUrl, loggingPort,
                    loggingTls, loggingTcp, accountManager, deployEggs, nearbyTracker, autoLogin, ultraIV, ultraQuests, isDefault];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async delete(name) {
        var sql = "DELETE FROM configs WHERE name = ?";
        var args = [name];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getDefault() {
        var sql = `
        SELECT name, backend_url, port, heartbeat_max_time, pokemon_max_time, raid_max_time, startup_lat, startup_lon, token, jitter_value,
               max_warning_time_raid, encounter_delay, min_delay_logout, max_empty_gmo, max_failed_count, max_no_quest_count, logging_url,
               logging_port, logging_tls, logging_tcp, account_manager, deploy_eggs, nearby_tracker, auto_login, ultra_iv, ultra_quests,
               is_default
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
            c.backend_url,
            c.port,
            c.heartbeat_max_time,
            c.pokemon_max_time,
            c.raid_max_time,
            c.startup_lat,
            c.startup_lon,
            c.token,
            c.jitter_value,
            c.max_warning_time_raid,
            c.encounter_delay,
            c.min_delay_logout,
            c.max_empty_gmo,
            c.max_failed_count,
            c.max_no_quest_count,
            c.logging_url,
            c.logging_port,
            c.logging_tls,
            c.logging_tcp,
            c.account_manager,
            c.deploy_eggs,
            c.nearby_tracker,
            c.auto_login,
            c.ultra_iv,
            c.ultra_quests,
            c.is_default
        );
        return data;
    }
    static async setDefault(name) {
        // TODO: Update both in one sql statement
        var sql = "UPDATE configs SET is_default = 0 WHERE name != ?";
        var args = [name];
        var result = await query(sql, args);
        if (result.affectedRows > 0) {
            // Success
        }
        sql = "UPDATE config SET is_default = 1 WHERE name = ?";
        result = await query(sql, args);
        return result.affectedRows === 1;
    }
    async save(oldName) {
        var sql = `
        UPDATE configs
        SET name=?, backend_url=?, port=?, heartbeat_max_time=?, pokemon_max_time=?, raid_max_time=?, startup_lat=?, startup_lon=?, token=?, jitter_value=?,
            max_warning_time_raid=?, encounter_delay=?, min_delay_logout=?, max_empty_gmo=?, max_failed_count=?, max_no_quest_count=?, logging_url=?, logging_port=?,
            logging_tls=?, logging_tcp=?, account_manager=?, deploy_eggs=?, nearby_tracker=?, auto_login=?, ultra_iv=?, ultra_quests=?, is_default=?
        WHERE name=?`;
        var args = [
            this.name,
            this.backendUrl,
            this.port,
            this.heartbeatMaxTime,
            this.pokemonMaxTime,
            this.raidMaxTime,
            this.startupLat,
            this.startupLon,
            this.token,
            this.jitterValue,
            this.maxWarningTimeRaid,
            this.encounterDelay,
            this.minDelayLogout,
            this.maxEmptyGmo,
            this.maxFailedCount,
            this.maxNoQuestCount,
            this.loggingUrl,
            this.loggingPort,
            this.loggingTls,
            this.loggingTcp,
            this.accountManager,
            this.deployEggs,
            this.nearbyTracker,
            this.autoLogin,
            this.ultraIV,
            this.ultraQuests,
            this.isDefault,
            oldName
        ];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Config;