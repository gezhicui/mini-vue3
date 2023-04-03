import { h } from '../lib/mini-vue3.esm.js';
import { Foo } from './Foo.js';

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
      // 常规节点 [h('p', { class: 'red' }, this.msg), h('p', { class: 'blue' }, 'mini-vue')]
      // 带props的组件
      [h('div', {}, 'hi, ' + this.msg), h(Foo, { count: 1 })]
    );
  },

  setup() {
    return {
      msg: 'asdasdasdas',
    };
  },
};
