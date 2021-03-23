require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { port } = require('./config');
const di = require('./di');

// di.get('db1').getRows('posts', 0, 5).then(console.log);

const app = express();
app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => res.send('Express server is up and running!'));

const getDb = (req, res, next) => {
  req.db = di.get(req.params.db);
  if (req.params.table) req.table = req.params.table;
  next();
};

app.get('/:db/tables', getDb, (req, res) => req.db.getTables().then((tables) => res.send(tables)));

app.get('/:db/tables/:table/rows', getDb, (req, res) => {
  req.db.getRows(req.table).then((rows) => res.send(rows));
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
