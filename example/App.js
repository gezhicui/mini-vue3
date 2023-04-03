import { h } from '../lib/mini-vue3.esm.js';
window.self = null;
export const App = {
  /* 
  <div id="root" class="red,hard">
    <p class="red">hi</p>
    <p class="blue">mini-vue</p>
  </div>
  */
  render() {
    window.self = this;
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard'],
        onClick() {
          console.log('click');
        },
      },
      [h('p', { class: 'red' }, this.msg), h('p', { class: 'blue' }, 'mini-vue')]
    );
  },

  setup() {
    return {
      msg: 'asdasdasdas',
    };
  },
};
