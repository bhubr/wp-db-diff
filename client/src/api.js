import axios from 'axios';
import { serverPort } from './config';

const instance = axios.create({
  baseURL: `http://localhost:${serverPort}`,
});

const dbs = ['db1', 'db2'];

function getTablesFromDb(db) {
  return instance.get(`/${db}/tables`).then((res) => res.data);
}

// eslint-disable-next-line import/prefer-default-export
export function getTables() {
  const promises = dbs.map((db) => getTablesFromDb(db));
  return Promise.all(promises)
    .then((allDbsTables) => dbs.reduce((carry, db, i) => ({
      ...carry, [db]: allDbsTables[i],
    }), {}));
}

function getRowsFromDbTable(db, table) {
  return instance.get(`/${db}/tables/${table}/rows`).then((res) => res.data);
}

function getPkFromDbTable(db, table) {
  return instance.get(`/${db}/tables/${table}/pk`).then((res) => res.data);
}

// eslint-disable-next-line import/prefer-default-export
export function getRows(table) {
  const promises = dbs.map((db) => getRowsFromDbTable(db, table));
  return Promise.all(promises);
}

// eslint-disable-next-line import/prefer-default-export
export function getPk(table) {
  const promises = dbs.map((db) => getPkFromDbTable(db, table));
  return Promise.all(promises);
}
