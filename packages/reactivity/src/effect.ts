import { isArray, isIntegerKey } from '@vue/shared';
import { TriggerOpTypes } from './operations';

// 定义effect
export function effect(fn, options: any = {}) {
  //我们需要这个effect变成响应式的effct，可以做到数据变化重新执行，得到的effect是一个函数
  const effect = createReactiveEffect(fn, options);
  //(1)响应式的effect默认会先执行一次
  if (!options.lazy) {
    effect();
  }

  return effect;
}

let uid = 0;
//存放当前的effect
let activeEffect;
//创建一个栈
const effectStack = [];
function createReactiveEffect(fn, options) {
  /*  通过栈解决以下问题
 effect(() => { [effect1]<-cur
    state.name;
    effect(() => { [effect1,effect2]<-cur
      stage.age;
    });
    state.a; [effect1]<-cur
  }); 
  */
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect);
        activeEffect = effect;
        // 执行用户定义的方法
        fn();
      } finally {
        //出栈
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effect.id = uid++; //添加标识，用于区分effect(是谁的)
  effect._isEffect = true; // 这个标识用于区分他是响应式effect
  effect.raw = fn; //保存用户的原函数
  effect.options = options; //再effect上保存用户的选项
  return effect;
}

/*
 *targetMap结构：{
 *  key:被代理的对象(Object)
 *  value:Map{
 *    key:属性名
 *    value:属性名对应的依赖(Set<Function>)
 *  }
 *}
 */
let targetMap = new WeakMap();
export function Track(target, type, key) {
  // console.log(target, type, key, activeEffect);
  if (!activeEffect) {
    // 没有在effect中使用 直接中断
    return;
  }
  // 获取effect
  let depsMap = targetMap.get(target);
  //没有
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map())); //第二个参数是不是他
  }
  //有
  let dep = depsMap.get(key);
  if (!dep) {
    //没有key
    depsMap.set(key, (dep = new Set()));
  }
  //设置  set
  if (!dep.has(activeEffect)) {
    //没有
    dep.add(activeEffect);
  }
  // console.log(targetMap);
}

export function trigger(target, type, key?, newValue?, oldValue?) {
  // console.log(target, type, key, newValue, oldValue);
  console.log(targetMap);

  // 触发依赖
  const depsMap = targetMap.get(target); // 查找是否有目标对象
  if (!depsMap) {
    return;
  }
  console.log(depsMap);

  let effectSet = new Set(); //如果同一个effect中有多个同时修改一个值，并且相同 ，set 过滤一下
  const add = effectAdd => {
    if (effectAdd) {
      effectAdd.forEach(effect => effectSet.add(effect));
    }
  };
  //处理数组 就是 key === length   修改 数组的 length
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      // 如果更改 的长度 小于 收集的索引 ，那么这个索引需要重新执行 effect
      if (key === 'length' || key > newValue) {
        add(dep);
      }
    });
  } else {
    //处理对象
    if (key != undefined) {
      add(depsMap.get(key)); //获取当前属性的effect
    }
    //修改数组索引对应的值
    switch (type) {
      case TriggerOpTypes.ADD:
        // 判断数组是否有这个索引
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'));
        }
    }
  }
  //执行
  effectSet.forEach((effect: any) => effect());
}
