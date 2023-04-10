import { h, provide, inject } from '../../lib/mini-vue3.esm.js';

export const App = {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, 'i am app'), h(Provider)]);
  },
};

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal');
    provide('bar', 'barVal');
    provide('hhh', 'hhhhhh');
  },
  render() {
    return h('div', {}, [h('p', {}, 'i am Provider'), h(ProviderFoo)]);
  },
};

const ProviderFoo = {
  name: 'ProviderFoo',
  setup() {
    provide('foo', 'footwo');
    const foo = inject('foo');
    return {
      foo,
    };
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderFoo foo: ${this.foo}`), h(Consumer)]);
  },
};

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    const baz = inject('baz', () => 'bazVal');
    const hhh = inject('hhh');

    return {
      foo,
      bar,
      baz,
      hhh,
    };
  },
  render() {
    return h('div', {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.hhh}`);
  },
};
