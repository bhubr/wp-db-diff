import 'regenerator-runtime';
import PubSub from 'pubsub-js';
import page from 'page';
import { getTables, getRows, getPk } from './api';
import { network } from './event-types';
import TablesList from './tables-list';
import RowsList from './rows-list';

class Main {
  constructor() {
    this.renderTables = this.renderTables.bind(this);
    this.onTableSelected = this.onTableSelected.bind(this);
    this.showTableRows = this.showTableRows.bind(this);
    this.tablesLists = null;
    this.slot = document.getElementById('slot');
    page('/', this.renderTables);
    page('/:table', this.showTableRows);
    page();
    // this.bindEventListeners();
  }

  // eslint-disable-next-line class-methods-use-this
  init() {
    PubSub.subscribe('table:select', this.onTableSelected);
    getTables()
      .then((tables) => {
        this.tablesLists = [
          new TablesList('db1', 0, [tables.db1, tables.db2]),
          new TablesList('db2', 1, [tables.db2, tables.db1]),
        ];
        this.renderTables();
      });
  }

  // eslint-disable-next-line class-methods-use-this
  onTableSelected(msg, table) {
    page(`/${table}`);
  }

  renderTables() {
    if (!this.tablesLists) return;
    this.slot.innerHTML = `
    <div class="tables-wrapper">
      <div id="db1">
        <div class="tables"></div>
      </div>
      <div id="db2">
        <div class="tables"></div>
      </div>
    </div>
    `;
    this.tablesLists.forEach((t) => t.render());
  }

  // eslint-disable-next-line class-methods-use-this
  async showTableRows(ctx) {
    const { table } = ctx.params;
    const allRows = await getRows(table);
    const [pk] = await getPk(table);
    console.log(allRows, pk)
    const rowsLists = [
      new RowsList('db1', 0, allRows, pk),
      new RowsList('db2', 1, allRows, pk),
    ];
    this.slot.innerHTML = `
    <div class="rows-wrapper">
      <div id="db1">
        <div class="rows"></div>
      </div>
      <div id="db2">
        <div class="rows"></div>
      </div>
    </div>
    `;
    rowsLists.forEach((rowList) => rowList.render());
  }

  // bindEventListeners() {
  //   PubSub.subscribe(network.onTablesReceived, this.renderTables);
  // }
}

new Main().init();
