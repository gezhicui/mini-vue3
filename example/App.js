import { h } from '../lib/mini-vue3.esm.js';

export const App = {
  /* 
  <div id="root" class="red,hard">
    <p class="red">hi</p>
    <p class="blue">mini-vue</p>
  </div>
  */
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard'],
      },
      [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
    );
  },

  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
