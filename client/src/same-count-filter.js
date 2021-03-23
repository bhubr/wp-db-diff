import PubSub from 'pubsub-js';

export default class SameCountFilter {
  constructor(id) {
    this.el = document.getElementById(id);
    this.onToggleCheckbox = this.onToggleCheckbox.bind(this);
    this.bindEventListeners();
  }

  bindEventListeners() {
    this.el.addEventListener('change', this.onToggleCheckbox);
  }

  onToggleCheckbox(e) {
    PubSub.publish('show-hide-same-count:changed', e.target.checked);
  }
}
