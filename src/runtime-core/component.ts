import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { publicInstanceProxyHandlers } from './componentPublicInstance';

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
  };
  // bind方法第一个传null得话不改变this指向,而且可以在后续的调用中去传入参数
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  // 1. props
  initProps(instance, instance.vnode.props);
  // 2. slots
  // 3. setup
  setupStatefulComponent(instance);
  // 4. render
  // 5. effect
}

function setupStatefulComponent(instance) {
  const Component = instance.vnode.type;
  // 处理组件中的this.xx
  instance.proxy = new Proxy(
    {
      _: instance,
    },
    publicInstanceProxyHandlers
  );

  const { setup } = Component;
  // 执行组件的setup方法，传入相应参数
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;
  instance.render = Component.render;
}
