require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bluebird = require('bluebird');
const { port } = require('./config');
const di = require('./di');

// di.get('db1').getRows('posts', 0, 5).then(console.log);

const app = express();
app.use(morgan('dev'));
app.use(
  cors({
    exposedHeaders: ['x-row-count'],
  }),
);

app.get('/', (req, res) => res.send('Express server is up and running!'));

const getDb = (req, res, next) => {
  req.db = di.get(req.params.db);
  if (req.params.table) req.table = req.params.table;
  next();
};

const rowCounts = {
  db1: {},
  db2: {},
};

bluebird.each(Object.keys(rowCounts), async (db) => {
  const dbInstance = di.get(db);
  const tables = await dbInstance.getTables();
  await bluebird.each(tables, async (table) => {
    const count = await dbInstance.countRows(table);
    rowCounts[db][table] = count;
  });
});

app.get(
  '/:db/tables',
  getDb,
  (req, res) => req.db
    .getTables()
    .then(
      (tables) => res.send(tables.map((name) => ({
        name, count: rowCounts[req.params.db][name],
      }))),
    ),
);

app.get('/:db/tables/:table/rows', getDb, (req, res) => {
  console.log(req.table, rowCounts);
  req.db.getRows(req.table).then((rows) => res.send(rows)).catch((err) => {
    console.error(err);
    res.send([]);
  });
});

app.get('/:db/tables/:table/pk', getDb, (req, res) => {
  req.db.getPk(req.table).then((rows) => res.send(rows));
});

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Express server listening on ${port}`);
  }
});
