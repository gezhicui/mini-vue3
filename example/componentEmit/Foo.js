import { h } from '../../lib/mini-vue3.esm.js';

export const Foo = {
  render() {
    const btn = h(
      'button',
      {
        onClick: this.emitAdd,
      },
      'emitAdd'
    );

    const foo = h('p', {}, 'foo');
    return h('div', {}, [btn, foo]);
  },
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log('emit add');
      emit('add', 1, 2);
      emit('add-foo');
      return;
    };

    return {
      emitAdd,
    };
  },
};
