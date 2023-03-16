import { isObject, isArray, isIntegerKey, hasOwn } from '@vue/shared';
import { readonly, reative } from './reactiveApi';
import { TrackOpTypes, TriggerOpTypes, haseChange } from './operations';
import { track, trigger } from './effect';

function createGetter(isReadOnly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    if (!isReadOnly) {
      // 收集依赖
      track(target, TrackOpTypes.GET, key);
    }
    // 浅层代理，只对第一层进行代理
    if (shallow) {
      return res;
    }
    // 深层递归代理。 这里是懒代理，如果没有访问深层对象就不进行代理，访问到了再进行代理，是vue的性能优化
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reative(res);
    }
    return res;
  };
}

function createSetter(shallow = false) {
  //拦截设置的功能
  return function set(target, key, value, receiver) {
    // 获取老值
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    // haskey：target(数组或对象)中是否有key这个属性
    let haskey =
      isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);

    if (!haskey) {
      // 如果是新的key，则去新增
      trigger(target, TriggerOpTypes.ADD, key, value);
    } else {
      if (!haseChange(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue);
      }
    }
    return result;
  };
}

// 处理get
const get = createGetter();
const shallowReactiveGet = createGetter(false, true);
const reandonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

// 处理set
const set = createSetter();
const shallowSet = createSetter(true);
const errorSet = (target, key) => {
  console.warn(`set ${target} on key ${key} falied`);
};

export const reativeHandlers = {
  get,
  set,
};
export const shallowReativeHandlers = {
  get: shallowReactiveGet,
  set: shallowSet,
};
export const readonlyHandlers = {
  get: reandonlyGet,
  set: errorSet,
};
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: errorSet,
};
