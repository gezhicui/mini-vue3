import { ReactiveEffect } from './effect';

class ComputedRefImpl {
  private _getter: any;
  private _dirty = true;
  private _value: any;
  private _effect: any;
  constructor(getter) {
    this._getter = getter;
    this._effect = new ReactiveEffect(getter, () => {
      // 依赖的响应式数据发生变化的时候，会执行这个回调，重新把_dirty变为true
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    // 当_dirty=true时，说明computed里的数据已经发生过改变，需要再执行计算
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }

    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
