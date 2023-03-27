import { isTracking, trackEffects, triggerEffects } from './effect';
import { hasChanged, isObject } from '../shared/index';
import { reactive } from './reactive';

class RefImpl {
  private _value: any; // 存的是运算时的数据，如果是对象会被proxy代理
  private _rawValue: any; // 存储最原始的传入数据,用于判断是否改变
  public dep;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    // 看看传进来的数据是不是对象
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    if (isTracking()) {
      trackEffects(this.dep);
    }
    // 依赖收集
    return this._value;
  }

  set value(newValue) {
    // 如果新旧值不变 则不进行处理
    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}
