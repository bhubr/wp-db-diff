import PubSub from 'pubsub-js';

const colorClasses = [
  'text-danger', 'text-success',
];

export default class TablesList {
  constructor(id, index, tables) {
    this.id = id;
    this.index = index;
    this.tables = tables;
    this.allTables = this.reduceTables();
  }

  reduceTables() {
    const out = [];
    [0, 1].forEach((idx) => {
      this.tables[idx].forEach((t) => {
        if (!out.includes(t)) out.push(t);
      });
    });
    return out.sort();
  }

  isInThisDb(table) {
    return this.tables[0].find((t) => t === table);
  }

  isInOtherDb(table) {
    return this.tables[1].find((t) => t === table);
  }

  render() {
    // Object.keys(tables).forEach((db) => {
    const list = document.createElement('UL');
    list.classList.add('list-group');
    this.allTables.forEach((t) => {
      const item = document.createElement('LI');
      item.classList.add('list-group-item');
      list.appendChild(item);
      item.innerHTML = this.isInThisDb(t) ? t : '&nbsp;';
      if (!this.isInOtherDb(t)) item.classList.add(colorClasses[this.index]);
      item.addEventListener('click', () => PubSub.publish('table:select', t));
    });
    document.querySelector(`#${this.id} .tables`).appendChild(list);
  }
}