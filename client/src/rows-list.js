/* eslint-disable no-param-reassign */
/* global JSONTree */
import equal from 'fast-deep-equal';
import unserialize from './unserialize';
// import JSONTree from './json-tree';

const colorClasses = ['text-danger', 'text-success'];

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// eslint-disable-next-line max-len
// [...(new DOMParser().parseFromString('asdasd<p>Yo</p>', 'text/html').body.childNodes)].map(n => n.nodeType)
// returns [3, 1] (3 = text node, 1 = element node).
function containsHTML(str) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  const { body: { childNodes } } = doc;
  const hasHTMLElement = [...childNodes].some((n) => n.nodeType === 1);
  return hasHTMLElement;
}

const getKeyValRendererFn = (idKey, keyKey, valueKey) => (listItemEl, row, pks) => {
  // { meta_id: id, meta_key: k, meta_value: v }
  const id = row[idKey];
  const k = row[keyKey];
  const v = row[valueKey];
  // const pkSpan = document.createTextNode(pks);
  // item.appendChild(pkSpan);
  // const keyEl = document.createElement('STRONG');
  // keyEl.innerText = ` ${k} `;
  // item.appendChild(keyEl);
  const base = `${pks} <strong> ${k} `;
  let val;
  const hasHTML = containsHTML(v);
  // console.log(id, k, v, 'has HTML:', hasHTML);
  console.log(id);

  // Does it contain HTML?
  if (v.includes('tve') || hasHTML) {
    val = escapeHTML(v).substr(0, 100);

  // Is it serialized?
  } else if (/a:/.test(v)) {
    const unserializedVal = unserialize(v);
    val = JSONTree.create(unserializedVal);
    // val = v.substr(0, 100);
    // console.log(id, val, unserializedVal);

  // None of that
  } else {
    val = v;
  }
  listItemEl.innerHTML = `${base}${val}`;
};

const metaRendererFn = getKeyValRendererFn('meta_id', 'meta_key', 'meta_value');
const optionRendererFn = getKeyValRendererFn('option_id', 'option_name', 'option_value');

const textColumnRenderers = {
  posts: 'post_title',
  comments: 'comment_content',
  wpil_report_links: 'raw_url',
  terms: 'name',
  options: optionRendererFn,
  usermeta: metaRendererFn,
  postmeta: metaRendererFn,
};

export default class RowsList {
  constructor(id, table, index, rows, pks) {
    this.id = id;
    this.table = table;
    this.index = index;
    this.bothTablesRows = rows;
    this.pks = pks;
    this.findCb = (item1) => (item2) => this.pks.reduce(
      (carry, pk) => carry && item1[pk] === item2[pk], true,
    );
    // this.allRows = this.reduceRows();
    this.allPks = this.reducePks();
  }

  reducePks() {
    const { pks, findCb } = this;
    if (!Array.isArray(pks)) {
      throw new Error(
        'reducePks should be called with an array of primary keys',
      );
    }
    const uniquePksOutput = [];
    const getPkFields = (item) => pks.reduce(
      (carry, pk) => ({
        ...carry,
        [pk]: item[pk],
      }),
      {},
    );

    this.bothTablesRows.forEach((oneTablesRows) => {
      oneTablesRows.forEach((entry) => {
        const entryInOut = uniquePksOutput.find(findCb(entry));
        if (!entryInOut) uniquePksOutput.push(getPkFields(entry));
      });
    });
    return uniquePksOutput;
  }

  // reduceRows() {
  //   const out = [];
  //   [0, 1].forEach((idx) => {
  //     this.rows[idx].forEach((row) => {
  //       if (!out.find((el) => this.haveSamePk(el, row))) out.push(row);
  //     });
  //   });
  //   return out.sort();
  // }

  isInThisTable(row) {
    return this.bothTablesRows[this.index].find(this.findCb(row));
  }

  isInOtherTable(row) {
    return this.bothTablesRows[(this.index + 1) % 2].find(this.findCb(row));
  }

  renderRowText(item, row) {
    const renderer = textColumnRenderers[this.table];
    const pks = this.pks.map((k) => row[k]).join();
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
        item.innerHTML = `${pks} N/A`;
    }
  }

  render() {
    // Create list
    const list = document.createElement('UL');
    list.classList.add('list-group');
    document.querySelector(`#${this.id} .rows`).appendChild(list);

    this.allPks.forEach((pk) => {
      // Create list item
      const listItemEl = document.createElement('LI');
      listItemEl.classList.add('list-group-item');
      list.appendChild(listItemEl);

      // Look up row in this table & the other, matching this/these pk(s)
      const entryInThis = this.isInThisTable(pk);
      const entryInOther = this.isInOtherTable(pk);

      // If a row is found in this table, render it, otherwise display a blank cell
      if (entryInThis) {
        this.renderRowText(listItemEl, entryInThis);
      } else {
        listItemEl.innerHTML = '&nbsp';
      }
      // item.innerHTML = isInThis ? `${this.pks.map((k) => r[k]).join()} ${text}` : '&nbsp;';
      if (!entryInOther) {
        listItemEl.classList.add(colorClasses[this.index]);
        listItemEl.classList.add('font-weight-bolder');
      }
      if (entryInThis && entryInOther) {
        const areEqual = equal(entryInThis, entryInOther);
        if (!areEqual) {
          listItemEl.classList.add('text-info');
          listItemEl.classList.add('font-weight-bolder');
        }
      }
      listItemEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.className.includes('jst')) return;
        console.log(entryInThis, entryInOther);
      });
    });
  }
}
