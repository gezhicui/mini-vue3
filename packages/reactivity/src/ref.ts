//使用  toRefs
import { track, trigger } from './effect';
import { TrackOpTypes, TriggerOpTypes, haseChange } from './operations';
export function ref(target) {
  return createRef(target);
}

export function shallowRef(target) {
  //浅的
  return createRef(target, true);
}

//创建类

class RefImpl {
  //属性
  public __v_isRef = true; //标识 他是 ref
  public _value; // 声明
  constructor(public rawValue, public shallow) {
    //ts
    //  this.target = target
    this._value = rawValue; //用户传入的值  原来的值
  }

  //类的属性访问器   问题实现响应式   收集依赖Track  触 发更新  trigger
  get value() {
    //获取  name.value
    track(this, TrackOpTypes.GET, 'value'); //收集依赖
    return this._value;
  }
  set value(newValue) {
    //name.value = 'lis'   name.value = 'wnu'
    if (!haseChange(newValue, this._value)) {
      this._value = newValue; //新值给就zh
      this.rawValue = newValue;
      trigger(this, TriggerOpTypes.SET, 'value', newValue);
    }
  }
}

function createRef(rawValue, shallow = false) {
  //创建ref   实例对象
  return new RefImpl(rawValue, shallow);
}
