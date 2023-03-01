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
  /*  通过栈解决一下问题
 effect(() => { [effect1]<-cur
    state.name;
    effect(() => { [effect1,effect2]<-cur
      stage.age;
    });
    state.a; [effect1]<-cur
  }); 
  */
  const effect = function reactiveEffect() {
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
  };
  effect.id = uid++; //添加标识，用于区分effect(是谁的)
  effect._isEffect = true; // 这个标识用于区分他是响应式effect
  effect.raw = fn; //保存用户的原函数
  effect.options = options; //再effect上保存用户的选项
  return effect;
}

export function Track(target, type, key) {
  console.log(target, type, key, activeEffect);
}
