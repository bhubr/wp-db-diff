const Di = require('simple-dijs');
const dbFactory = require('./db');
const { dbs } = require('./config');

module.exports = new Di({
  db1: dbFactory(dbs[0]),
  db2: dbFactory(dbs[1]),
});
