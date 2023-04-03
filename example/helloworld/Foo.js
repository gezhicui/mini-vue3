import { h } from '../../lib/mini-vue3.esm.js';

// 测试props
export const Foo = {
  render() {
    return h('div', {}, 'foo: ' + this.count);
  },
  setup(props) {
    // 读取props
    console.log(props);
    // props是readonly的
  },
};
