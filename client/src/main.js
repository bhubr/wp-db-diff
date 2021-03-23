import axios from 'axios';
import { serverPort } from './config';

const instance = axios.create({
  baseURL: `http://localhost:${serverPort}`,
});


function getTables(db) {
  return instance.get(`/${db}/tables`).then(res => res.data)
}

const dbs = ['db1', 'db2'];

dbs.forEach(db => {
  getTables(db)
  .then(tables => {
    document.querySelector(`#${db} .tables`).innerHTML = `
      <ul>
        ${tables.map(t => `<li>${t}</li>`).join('')}
      </ul>
    `
  })
})
