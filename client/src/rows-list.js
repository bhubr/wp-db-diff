import PubSub from 'pubsub-js';

const colorClasses = [
  'text-danger', 'text-success',
];

export default class RowsList {
  constructor(id, index, rows, pk) {
    this.id = id;
    this.index = index;
    this.rows = rows;
    this.pk = pk;
    this.haveSamePk = (a, b) => pk.reduce(
      (carry, col) => carry && (a[col] === b[col]), true,
    );
    this.allRows = this.reduceRows();
  }

  reduceRows() {
    const out = [];
    [0, 1].forEach((idx) => {
      this.rows[idx].forEach((row) => {
        if (!out.find((el) => this.haveSamePk(el, row))) out.push(row);
      });
    });
    return out.sort();
  }

  isInThisTable(row) {
    return this.rows[this.index].find(el => this.haveSamePk(el, row));
  }

  isInOtherTable(row) {
    return this.tables[(this.index + 1) % 2].find(el => this.haveSamePk(el, row));
  }

  render() {
    // Object.keys(tables).forEach((db) => {
    const list = document.createElement('UL');
    list.classList.add('list-group');
    this.allRows.forEach((r) => {
      const item = document.createElement('LI');
      item.classList.add('list-group-item');
      list.appendChild(item);
      item.innerHTML = this.isInThisTable(r) ? this.pk.map(k => r[k]).join() : '&nbsp;';
      // if (!this.isInOtherDb(t)) item.classList.add(colorClasses[this.index]);
      // item.addEventListener('click', () => PubSub.publish('table:select', t));
    });
    document.querySelector(`#${this.id} .rows`).appendChild(list);
  }
}