import { isObject } from '@vue/shared';
import { readonly, reative } from './reactiveApi';

function createGetter(isReadOnly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    if (!isReadOnly) {
      //收集依赖
    }
    if (shallow) {
      // 浅层代理，只对第一层进行代理
      return res;
    }
    if (isObject(res)) {
      // 如果访问的属性是一个对象，则递归代理
      // 这里是懒代理，如果没有访问深层对象就不进行代理，访问到了再进行代理，是vue的性能优化
      return isReadOnly ? readonly(res) : reative(res);
    }
    return res;
  };
}

function createSetter(shallow = false) {
  //拦截设置的功能
  return function set(target, key, value, receiver) {
    //state.name = 100
    const result = Reflect.set(target, key, value, receiver); // target[key] = value
    //当数据更新时候 通知对应属性的effect重新执行
    // 我们要区分是新增的 还是 修改的  vue2 里无法监控更改索引，无法监控数组的长度变化
    // =》 hack的方法  需要特殊处理
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
