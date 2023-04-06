import { h, renderSlots } from '../../lib/mini-vue3.esm.js';

export const Foo = {
  setup() {
    return {};
  },
  render() {
    const foo = h('h3', {}, 'foo');
    // renderSlots
    // 获取到渲染的元素
    // 获取到渲染的位置
    // 作用域插槽
    const age = 10;
    return h('div', {}, [
      renderSlots(this.$slots, 'header', {
        age,
      }),
      foo,
      renderSlots(this.$slots, 'footer'),
    ]);
  },
};
