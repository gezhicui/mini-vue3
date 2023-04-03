import { h } from '../../lib/mini-vue3.esm.js';
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    // emit
    return h('div', {}, [
      h('div', {}, 'App'),
      h(Foo, {
        // on + event name
        onAdd: (a, b) => {
          console.log('App onAdd', a, b);
        },
        onAddFoo: () => {
          console.log('App onAddFoo');
        },
      }),
    ]);
  },
  setup() {
    return {};
  },
};
