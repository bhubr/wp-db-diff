import 'regenerator-runtime';
import PubSub from 'pubsub-js';
import page from 'page';
import { getTables, getRows, getPk } from './api';
import TablesList from './tables-list';
import RowsList from './rows-list';
import SameCountFilter from './same-count-filter';
import Breadcrumb from './breadcrumb';

class Main {
  constructor() {
    this.renderTables = this.renderTables.bind(this);
    this.onTableSelected = this.onTableSelected.bind(this);
    this.showTableRows = this.showTableRows.bind(this);

    this.tablesLists = null;
    this.slot = document.getElementById('slot');

    // Sub-components
    this.sameCountFilter = new SameCountFilter('show-hide-same-count');
    this.breadcrumb = new Breadcrumb('breadcrumb');
    this.breadcrumb.render();

    this.setupRoutes();
    this.bindEventListeners();
  }

  setupRoutes() {
    page('/', this.renderTables);
    page('/:table', this.showTableRows);
    page();
  }

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

  onTableSelected(msg, table) {
    page(`/${table}`);
  }

  renderTables(doHideSameCount = false) {
    if (!this.tablesLists) return;
    this.breadcrumb.pop();
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
    this.tablesLists.forEach((t) => t.render(doHideSameCount));
  }

  async showTableRows(ctx) {
    const { table } = ctx.params;
    this.breadcrumb.push({ href: ctx.path, label: table });
    const allRows = await getRows(table);
    const [pk] = await getPk(table);
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

  bindEventListeners() {
    PubSub.subscribe('show-hide-same-count:changed', (evtName, doHide) => this.renderTables(doHide));
  }
}

new Main().init();
