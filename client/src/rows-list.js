/* eslint-disable no-param-reassign */
/* global JSONTree */
import equal from 'fast-deep-equal';
import unserialize from './unserialize';
// import JSONTree from './json-tree';

const colorClasses = [
  'text-danger', 'text-success',
];

const textColumnRenderers = {
  posts: 'post_title',
  comments: 'comment_content',
  wpil_report_links: 'raw_url',
  usermeta: (item, { meta_key: k, meta_value: v }, pks) => {
    // const pkSpan = document.createTextNode(pks);
    // item.appendChild(pkSpan);
    // const keyEl = document.createElement('STRONG');
    // keyEl.innerText = ` ${k} `;
    // item.appendChild(keyEl);
    const base = `${pks} <strong> ${k} `;
    let val;
    if (/a:/.test(v)) {
      // valEl = document.createTextNode('pouet');
      const unserializedVal = unserialize(v);
      val = JSONTree.create(unserializedVal);
    } else {
      val = v;
    }
    item.innerHTML = `${base}${val}`;
  },
};

export default class RowsList {
  constructor(id, table, index, rows, pk) {
    this.id = id;
    this.table = table;
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
    return this.rows[this.index].find((el) => this.haveSamePk(el, row));
  }

  isInOtherTable(row) {
    return this.rows[(this.index + 1) % 2].find((el) => this.haveSamePk(el, row));
  }

  renderRowText(item, row) {
    const renderer = textColumnRenderers[this.table];
    const pks = this.pk.map((k) => row[k]).join();
    let text;
    switch (typeof renderer) {
      case 'string':
        text = row[renderer].substr(0, 50);
        item.innerHTML = `${pks} ${text}`;
        break;
      case 'function':
        renderer(item, row, pks);
        break;
      default:
        item.innerHTML = 'N/A';
    }
  }

  render() {
    // Object.keys(tables).forEach((db) => {
    const list = document.createElement('UL');
    list.classList.add('list-group');
    this.allRows.forEach((r) => {
      let rInOther;
      const item = document.createElement('LI');
      item.classList.add('list-group-item');
      list.appendChild(item);
      const isInThis = this.isInThisTable(r);
      const isInOther = this.isInOtherTable(r);
      // const text = (r[] || 'N/A').substr(0, 50);
      // if it is in this table, render it
      if (isInThis) {
        this.renderRowText(item, r);
      } else {
        item.innerHTML = '&nbsp';
      }
      // item.innerHTML = isInThis ? `${this.pk.map((k) => r[k]).join()} ${text}` : '&nbsp;';
      if (!isInOther) item.classList.add(colorClasses[this.index]);
      if (isInThis && isInOther) {
        rInOther = this.rows[(this.index + 1) % 2].find((el) => this.haveSamePk(el, r));
        const areEqual = equal(r, rInOther);
        if (!areEqual) item.classList.add('text-info');
      }
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.className.includes('jst')) return;
        console.log(r, rInOther);
      });
    });
    document.querySelector(`#${this.id} .rows`).appendChild(list);
  }
}
