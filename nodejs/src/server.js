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
  console.log(req.params)
  req.db = di.get(req.params.db);
  next();
};

app.get('/:db/tables', getDb, (req, res) => req.db.getTables().then((tables) => res.send(tables)));

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Express server listening on ${port}`);
  }
});
