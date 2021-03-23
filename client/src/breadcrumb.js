import PubSub from 'pubsub-js';

export default class BreadCrumb {
  constructor(id) {
    this.links = [{
      href: '/', label: 'Home',
    }];
    this.el = document.getElementById(id);
  }

  push(link) {
    console.log('push', link);
    this.links.push(link);
    this.render();
  }

  pop() {
    if (this.links.length > 1) {
      const link = this.links.pop();
      console.log('pop', link);
    }
    this.render();
  }

  render() {
    this.el.innerHTML = '';
    this.links.forEach(({ href, label }, idx, links) => {
      const li = document.createElement('LI');
      this.el.appendChild(li);
      li.classList.add('breadcrumb-item');
      if (idx > 0 && idx === links.length - 1) {
        li.classList.add('active');
        li.ariaCurrent = 'page';
        li.innerText = label;
        return;
      }
      const a = document.createElement('A');
      a.href = href;
      a.innerText = label;
      li.appendChild(a);
    });
    console.log(this.el);
  }
}
