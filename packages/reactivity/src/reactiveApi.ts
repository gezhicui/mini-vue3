import { isObject } from '@vue/shared';

import {
  reativeHandlers,
  shallowReativeHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers';

export function reative(target) {
  return createReactObj(target, false, reativeHandlers);
}

export function shallowReative(target) {
  return createReactObj(target, false, shallowReativeHandlers);
}

export function readonly(target) {
  return createReactObj(target, false, readonlyHandlers);
}
export function shallowReadonly(target) {
  return createReactObj(target, false, shallowReadonlyHandlers);
}

// 实现代理的核心
const reativeMap = new WeakMap();
const readonlyMap = new WeakMap();

// 创建各种方法的代理
function createReactObj(target, isReadOnly, baseHandlers) {
  if (!isObject(target)) {
    return target;
  }
  const proxyMap = isReadOnly ? readonlyMap : reativeMap;
  //判断缓存中是否有这个对象
  const exisitProxy = proxyMap.get(target);
  if (exisitProxy) {
    return exisitProxy;
  }

  const proxy = new Proxy(target, baseHandlers);
  // 将要代理的对象和对应代理的结果缓存起来
  proxyMap.set(target, proxy);
  return proxy;
}
