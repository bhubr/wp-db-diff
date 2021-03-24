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
      .then((rows) => rows[0].count);
  }

  getPk(table) {
    return this.query(
      `SELECT k.COLUMN_NAME AS colName
      FROM information_schema.table_constraints t
      LEFT JOIN information_schema.key_column_usage k
      USING(constraint_name,table_schema,table_name)
      WHERE t.constraint_type='PRIMARY KEY'
          AND t.table_schema=DATABASE()
          AND t.table_name='${this.wpPrefix}${table}';`,
    )
      .then((rows) => rows.map(({ colName }) => colName));
  }

  getRows(table) { // , from, count) {
    const limit = ''; // 'LIMIT 0,500'; // `LIMIT ${from},${count}`;
    return this.query(`SELECT * FROM ${this.wpPrefix}${table} ${limit}`);
  }
}

function dbFactory(settings) {
  return new Database(settings);
}

module.exports = dbFactory;
