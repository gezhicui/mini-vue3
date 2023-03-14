import { isFuction } from '@vue/shared';
import { effect } from './effect';

// getterOrOptons可能是函数或对象
export function computed(getterOrOptons) {
  let getter; //获取数据
  let setter; //设置数据
  if (isFuction(getterOrOptons)) {
    //函数  getter
    getter = getterOrOptons;
    setter = () => {
      console.warn('computed value must be readonly');
    };
  } else {
    //对象 { get(),set()}
    getter = getterOrOptons.get;
    setter = getterOrOptons.set;
  }
  //返回值
  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  // 是否使用缓存的标识
  public _dirty = true;
  public _value;
  public effect;
  constructor(getter, public setter) {
    //这个effect先定义不执行
    this.effect = effect(getter, {
      lazy: true,
      sch: () => {
        //修改数据,执行trigger的时候执行
        if (!this._dirty) {
          this._dirty = true;
        }
      },
    });
    // console.log('初始化effect');
  }

  //获取  myAge.value  =>getter 方法中的值
  get value() {
    // 默认进行获取数据的时候才执行
    //console.log('执行computed get');

    if (this._dirty) {
      // 获取computed最新结果
      this._value = this.effect();
      // 获取完，改变状态，下次在数据未改变时获取直接返回之前的_value，不用再去执行effect
      this._dirty = false;
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}
