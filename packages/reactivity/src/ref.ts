import { track, trigger } from './effect';
import { reative } from './index';
import { TrackOpTypes, TriggerOpTypes, haseChange } from './operations';
import { isObject, isArray } from '@vue/shared';

const convert = val => (isObject(val) ? reative(val) : val);

// 创建类 实现ref
class RefImpl {
  // 标识ref
  public __v_isRef = true;
  // 存值
  public _value;
  constructor(public rawValue, public shallow) {
    this._value = shallow ? rawValue : convert(rawValue);
  }

  //类的属性访问器  实现依赖收集和触发更新
  get value() {
    track(this, TrackOpTypes.GET, 'value'); //收集依赖
    return this._value;
  }
  set value(newValue) {
    if (!haseChange(newValue, this._value)) {
      // 更新新值
      this._value = newValue;
      this.rawValue = newValue;
      trigger(this, TriggerOpTypes.SET, 'value', newValue);
    }
  }
}

function createRef(rawValue, shallow = false) {
  //创建ref   实例对象
  return new RefImpl(rawValue, shallow);
}

export function ref(target) {
  return createRef(target);
}

export function shallowRef(target) {
  return createRef(target, true);
}

// 实现toRef
class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public target, public key) {}
  get value() {
    return this.target[this.key];
  }
  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

//实现toRefs
export function toRefs(target) {
  //[1,2,3]
  //遍历
  let ret = isArray(target) ? new Array(target.length) : {};
  for (let key in target) {
    ret[key] = toRef(target, key); // toRef 实例
  }
  return ret;
}
