'use strict';

const query = require('../services/db.js');

class Stats {
    constructor(uuid_date_type, counter) {
        this.uuid_date_type = uuid_date_type;
        this.counter = counter;
    }
    static async getAll(key) {
        const sql = `
        SELECT ifnull(sum(counter), 0) as total FROM stats where uuid_date_type like ?`;
        const args = [`% + key + %`];
        const total = await query(sql, args);
        return total[0]['total'];
    }
    static async counter(uuid_date_type) {
        const sql = `
        INSERT INTO stats (uuid_date_type, counter)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
        counter = counter + 1`;
        const args = [uuid_date_type, 1];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Stats;
