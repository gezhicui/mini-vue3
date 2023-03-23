import { track, trigger } from './effect';
import { reactive, ReactiveFlags, readonly } from './reactive';
import { isObject } from '../shared';

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadOnly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }

    const res = Reflect.get(target, key);

    // 看看 res 是否是对象，如果是对象，需要递归代理,需要区分普通代理和readonly
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }

    if (!isReadOnly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    // 给出警告
    console.warn(`Set operation on key "${key}" failed: target is readonly.`);
    return true;
  },
};
