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
        if (!out.find((tt) => t.name === tt.name)) out.push(t);
      });
    });
    return out.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }

  isInThisDb(table) {
    return this.tables[0].find((t) => t.name === table);
  }

  isInOtherDb(table) {
    return this.tables[1].find((t) => t.name === table);
  }

  render(doHideSameCount) {
    let hidden = 0;

    // Create ul
    const list = document.createElement('UL');
    list.classList.add('list-group');

    // For each table, create a li
    this.allTables.forEach((t) => {
      // check if table is in this & the other db
      const elInThis = this.isInThisDb(t.name);
      const elInOther = this.isInOtherDb(t.name);

      if (elInThis && elInOther && (elInThis.count === elInOther.count) && doHideSameCount) {
        hidden += 1;
        return;
      }

      const item = document.createElement('LI');
      item.classList.add('list-group-item');
      list.appendChild(item);

      // show empty cell if table not in this database
      item.innerHTML = elInThis ? `${t.name} (${t.count})` : '&nbsp;';

      // color cell accordingly (left = red, right = green)
      if (!elInOther) {
        item.classList.add(colorClasses[this.index]);
        item.classList.add('font-weight-bolder');
      }

      // Show rows for this table
      item.addEventListener('click', () => PubSub.publish('table:select', t.name));
    });
    document.querySelector(`#${this.id} .tables`).appendChild(list);

    console.log('items hidden', hidden);
  }
}
