const mysql = require('mysql2');
const { promisify } = require('util');

class Database {
  constructor(settings) {
    const { wp_prefix: wpPrefix, ...rest } = settings;
    this.database = settings.database;
    this.wpPrefix = wpPrefix;
    const pool = mysql.createPool(rest);
    this.query = promisify(pool.query.bind(pool));
  }

  getTables() {
    return this.query('SHOW TABLES')
      .then((rows) => rows.map((row) => row[`Tables_in_${this.database}`].replace(this.wpPrefix, '')));
  }

  countRows(table) {
    return this.query(`SELECT COUNT(*) AS count FROM ${this.wpPrefix}${table}`)
      .then((rows) => rows.map((row) => row.count));
  }

  getRows(table, from, count) {
    const limit = `LIMIT ${from},${count}`;
    return this.query(`SELECT * FROM ${this.wpPrefix}${table} ${limit}`);
  }
}

function dbFactory(settings) {
  return new Database(settings);
}

module.exports = dbFactory;
