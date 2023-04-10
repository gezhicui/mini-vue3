import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { initSlots } from './componentSlots';
import { publicInstanceProxyHandlers } from './componentPublicInstance';

export function createComponentInstance(vnode, parent) {
  console.log('createComponentInstance', parent);
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
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
  initSlots(instance, instance.vnode.children);
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
    // 把全局的currentInstance指向现在正在执行setup的组件实例
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    //执行完setup，清空currentInstance
    setCurrentInstance(null);
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

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}
