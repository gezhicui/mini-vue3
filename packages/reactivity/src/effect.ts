import { isArray, isIntegerKey } from '@vue/shared';
import { TriggerOpTypes } from './operations';

// 定义effect
export function effect(fn, options: any = {}) {
  // 创建effect，每次使用effect的时候都会创建一个新的函数，这个函数就是收集的依赖
  const effect = createReactiveEffect(fn, options);
  //响应式的effect默认会先执行一次
  if (!options.lazy) {
    effect();
  }
  return effect;
}

let uid = 0;
//存放当前正在执行的effect
let activeEffect;
/* 创建一个栈来保存当前的effect， 通过栈解决以下问题
 effect(() => { [effect1]<-cur  effect入栈
    state.name;
    effect(() => { [effect1,effect2]<-cur effect入栈
      stage.age;
    }); // effect2执行完毕，出栈 [effect1]<-cur 
    state.a; [effect1]<-cur
  }); 
  */
const effectStack = [];
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect);
        activeEffect = effect;
        /* 
        执行用户传入effect的方法，
        步骤1、在effect方法中，读取proxy代理后的数据会触发get方法
        步骤2、get方法会触发依赖收集track
        步骤3、track中获取到刚刚赋值的activeEffect，加入该数据的依赖数组中，等待set的时候拿出来再次调用这个effect，即触发依赖
         */
        fn();
      } finally {
        // 函数运行完 effect出栈，activeEffect回退
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
 *  key:被代理的对象1(Object1)=> value:Map{
 *    key:属性名1 => value:属性名1对应的依赖(Set<Function>)
 *    key:属性名2 => value:属性名2对应的依赖(Set<Function>)
 *    ...属性名345
 *  },
 *  key2:被代理的对象2(Object2)=> value:Map{}...
 *  key3:被代理的对象3(Object3)=> value:Map{}...
 */
let targetMap = new WeakMap();

// 收集依赖
export function track(target, type, key) {
  // 当前执行环境没有在effect中，直接中断
  if (!activeEffect) return;

  // 获取代理对象已收集的依赖内容
  let depsMap = targetMap.get(target);
  // 如果代理对象暂时还没有依赖
  if (!depsMap) {
    // despMap保存的键是代理对象中的key(ProxyObj.key)，值是一个set，保存ProxyObj.key的依赖们
    targetMap.set(target, (depsMap = new Map()));
  }
  // 获取到这个key之前所保存的依赖
  let dep = depsMap.get(key);
  // 如果这个key没有依赖，则为他创建一个set保存他的依赖
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  // 保存key的依赖，使用set防止依赖重复收集
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

// 触发依赖
export function trigger(target, type, key?, newValue?, oldValue?) {
  console.log(targetMap);
  // 获取代理对象的属性依赖Map
  const depsMap = targetMap.get(target); // 查找是否有目标对象
  if (!depsMap) return;

  let effectSet = new Set(); //如果同一个effect中有多个同时修改一个值，并且相同 ，set 过滤一下
  const add = effectAdd => {
    if (effectAdd) {
      effectAdd.forEach(effect => effectSet.add(effect));
    }
  };
  // 处理通过array.length修改数组长度的情况
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      // 如果更改的长度小于收集的索引 ，那么这个索引需要重新执行依赖
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
  // 执行所有依赖
  effectSet.forEach((effect: any) => effect());
}
