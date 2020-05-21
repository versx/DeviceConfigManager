'use strict';

const path = require('path');
const fs = require('fs');
const query = require('./db.js');
const logger = require('./logger.js');
const utils = require('../utils.js');

const migrationsDir = path.resolve(__dirname, '../../migrations');

class Migrator {
    constructor() {
        this.done = false;
    }
    async load() {
        let count = 1;
        let done = false;
        while (!done) {
            if (query === undefined || query === null) {
                logger('dcm').error(`[DBController] Failed to connect to database (as root) while initializing. Try: ${count}/10`);
                if (count === 10) {
                    process.exit(-1);
                }
                count++;
                await utils.snooze(2500);
                continue;
            }
            done = true;
        }
        
        let version = 0;
        const createMetadataTableSQL = `
        CREATE TABLE IF NOT EXISTS metadata (
            \`key\` VARCHAR(50) PRIMARY KEY NOT NULL,
            \`value\` VARCHAR(50) DEFAULT NULL
        );`;
        await query(createMetadataTableSQL)
            .then(x => x)
            .catch(err => {
                logger('dcm').error(`[DBController] Failed to create metadata table: (${err})`);
                process.exit(-1);
            });
        
        const getDBVersionSQL = `
        SELECT \`value\`
        FROM metadata
        WHERE \`key\` = "DB_VERSION"
        LIMIT 1;`;
        const results = await query(getDBVersionSQL)
            .then(x => x)
            .catch(err => {
                logger('dcm').error(`[DBController] Failed to get current database version: (${err})`);
                process.exit(-1);
            });
        if (results.length > 0) {
            version = parseInt(results[0].value);
        } else {
            version = 0;
        }
    
        const newestVersion = this.getNewestDbVersion();
        logger('dcm').info(`[DbController] Current: ${version}, Latest: ${newestVersion}`);
        this.migrate(version, newestVersion);
    }
    static async getEntries() {
        const sql = 'SELECT `key`, `value` FROM metadata';
        const results = await query(sql, []);
        return results;
    }
    async migrate(fromVersion, toVersion) {
        if (fromVersion < toVersion) {
            // Wait 30 seconds and let user know we are about to migrate the database and for them to make a backup until we handle backups and rollbacks.
            logger('dcm').info('[DBController] MIGRATION IS ABOUT TO START IN 30 SECONDS, PLEASE MAKE SURE YOU HAVE A BACKUP!!!');
            await utils.snooze(30 * 1000);
            logger('dcm').info(`[DBController] Migrating database to version ${(fromVersion + 1)}`);
            let migrateSQL;
            try {
                const sqlFile = `${migrationsDir}${path.sep}${fromVersion + 1}.sql`;
                migrateSQL = await utils.readFile(sqlFile);
                migrateSQL.replace('\r', '').replace('\n', '');
            } catch (err) {
                logger('dcm').error(`[DBController] Migration failed: ${err}`);
                process.exit(-1);
            }
            const sqlSplit = migrateSQL.split(';');
            sqlSplit.forEach(async sql => {
                const msql = sql.replace('&semi', ';').trim();
                if (msql !== '') {
                    logger('dcm').info(`[DBController] Executing: ${msql}`);
                    const result = await query(msql)
                        .then(x => x)
                        .catch(async err => {
                            logger('dcm').error(`[DBController] Migration failed: ${err}`);
                            /*
                            if (noBackup === undefined || noBackup === null || noBackup === false) {
                                for (let i = 0; i < 10; i++) {
                                    logger.warn(`[DBController] Rolling back migration in ${(10 - i)} seconds`);
                                    await utils.snooze(1000);
                                }
                                logger('dcm').info('[DBController] Rolling back migration now. Do not kill RDM!');
                            rollback(
                                backupFileSchema.path.toString(), 
                                backupFileTrigger.path.toString(), 
                                backupFileData.path.toString()
                            );
                            }
                            //fatalError(message);
                            return null;
                            */
                        });
                    logger('dcm').info(`[DBController] Migration execution result: ${result}`);
                    await utils.snooze(2000);
                }
            });
            
            const newVersion = fromVersion + 1;
            const updateVersionSQL = `
            INSERT INTO metadata (\`key\`, \`value\`)
            VALUES("DB_VERSION", ${newVersion})
            ON DUPLICATE KEY UPDATE \`value\` = ${newVersion};`;
            await query(updateVersionSQL)
                .then(x => x)
                .catch(err => {
                    logger('dcm').error(`[DBController] Migration failed: ${err}`);
                    process.exit(-1);
                });
            logger('dcm').info('[DBController] Migration successful');
            this.migrate(newVersion, toVersion);
        }
        if (fromVersion === toVersion) {
            logger('dcm').info('[DBController] Migration done');
            this.done = true;
        }
    }
    backup() {
        // TODO: Migrator backup
        /*
        let backupFileSchema: fs.WriteStream;
        let backupFileTrigger: fs.WriteStream;
        let backupFileData: fs.WriteStream;
        let uuidString = uuid.v4();
        let backupsDir = fs.opendirSync(backupsRoot);
        backupFileSchema = fs.createWriteStream(backupsDir.path + path.sep + uuidString + ".schema.sql");
        backupFileTrigger = fs.createWriteStream(backupsDir.path + path.sep + uuidString + ".trigger.sql");
        backupFileData = fs.createWriteStream(backupsDir.path + path.sep + uuidString + ".data.sql");
        let noBackup = process.env["NO_BACKUP"] || config.db.noBackup || false;
        if (noBackup === undefined || noBackup === null || noBackup === false) {
            let allTables = {
                account: true,
                assignment: true,
                device: true,
                device_group: true,
                discord_rule: true,
                group: true,
                gym: true,
                instance: true,
                metadata: true,
                pokemon: true,
                pokemon_stats: false,
                pokemon_shiny_stats: false,
                pokestop: true,
                quest_stats: false,
                raid_stats: false,
                invasion_stats: false,
                s2cell: true,
                spawnpoint: true,
                token: true,
                user: true,
                weather: true,
                web_session: true,
            };                
            let tablesShema = "";
            let tablesData = "";
            let allTablesSQL = `
                SHOW TABLES
            `;
            let results = await query(allTablesSQL)
            .then(x => x)
            .catch(err => {
                let message = `Failed to execute query. (${err})`
                logger('dcm').error(`[DBController] ${message}`);
                process.exit(-1);
            });
            let tableKeys = Object.keys(results);
            tableKeys.forEach(key => {
                let withData = allTables[key];
                tablesShema += ` ${key}`;
                if (withData) {
                    tablesData += ` ${key}`;
                }
            });
    
            logger('dcm').info(`[DBController] Creating backup ${uuidString}`);
            let mysqldumpCommand;
            if (os.type().toLowerCase() === "darwin") {
                mysqldumpCommand = "/usr/local/opt/mysql@5.7/bin/mysqldump"
            } else {
                mysqldumpCommand = "/usr/bin/mysqldump"
            }
            
            // Schema
            let args = ["-c", mysqldumpCommand + ` --set-gtid-purged=OFF --skip-triggers --add-drop-table --skip-routines --no-data ${database} ${tablesShema} -h ${host} -P ${port} -u ${rootUsername} -p${rootPassword.replace("\"", "\\\"") || ""} > ${backupFileSchema.path}`];
            let cmd = executeCommand("bash", args);
            if (cmd) {
                logger('dcm').error(`[DBController] Failed to create Command Backup: ${cmd}`);
                process.exit(-1);
            }
            // Trigger
            args = ["-c", mysqldumpCommand + ` --set-gtid-purged=OFF --triggers --no-create-info --no-data --skip-routines ${database} ${tablesShema}  -h ${host} -P ${port} -u ${rootUsername} -p${rootPassword.replace("\"", "\\\"") || ""} > ${backupFileTrigger.path}`];
            cmd = executeCommand("bash", args);
            if (cmd) {
                logger('dcm').error(`[DBController] Failed to create Command Backup: ${cmd}`);
                process.exit(-1);
            }
            // Data
            args = ["-c", mysqldumpCommand + ` --set-gtid-purged=OFF --skip-triggers --skip-routines --no-create-info --skip-routines ${database} ${tablesData}  -h ${host} -P ${port} -u ${rootUsername} -p${rootPassword.replace("\"", "\\\"") || ""} > ${backupFileData.path}`];
            cmd = executeCommand("bash", args);
            if (cmd) {
                logger('dcm').error(`[DBController] Failed to create Data Backup: ${cmd}`);
                process.exit(-1);
            }
        }
        */
    }
    rollback() {
        // TODO: Migrator rollback
    }
    getNewestDbVersion() {
        let current = 0;
        let keepChecking = true;
        while (keepChecking) {
            if (fs.existsSync(`${migrationsDir}${path.sep}${current + 1}.sql`)) {
                current++;
            } else {
                keepChecking = false;
            }
        }
        return current;
    }
    static async getValueForKey(key) {
        const sql = `
        SELECT value
        FROM metadata
        WHERE \`key\` = ?
        LIMIT 1;`;
        const args = [key];
        const results = await query(sql, args)
            .then(x => x)
            .catch(err => {
                logger('dcm').error(`[DbController] Error: ${err}`);
                return null;
            });
        if (results.length === 0) {
            return null;
        }
        const result = results[0];
        return result.value;
    }
    static async setValueForKey(key, value) {
        const sql = `
        INSERT INTO metadata (\`key\`, \`value\`)
        VALUES(?, ?)
        ON DUPLICATE KEY UPDATE
        value=VALUES(value);`;
        const args = [key, value];
        const results = await query(sql, args)
            .then(x => x)
            .catch(err => {
                logger('dcm').error(`[DbController] Error: ${err}`);
                return null;
            });
        logger('dcm').info(`[DbController] SetValueForKey: ${results}`);
    }
}

module.exports = Migrator;