import { h, createTextVNode } from '../../lib/mini-vue3.esm.js';
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    const app = h('h2', {}, '我是app');
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h('p', {}, '我是foo header作用域插槽:' + age),
          h('p', {}, '我是foo header内容插槽'),
          createTextVNode('你好呀'),
        ],
        footer: () => h('p', {}, 'footer'),
      }
    );

    return h('div', {}, [app, foo]);
  },
  setup() {
    return {};
  },
};
