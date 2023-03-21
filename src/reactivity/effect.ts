let activeEffect;
let shouldTrack;

class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    // 当前effect执行，activeEffect指向当前effect，为依赖收集做准备
    activeEffect = this;
    return this._fn();
  }
}

const targetMap = new Map();
export function track(target, key) {
  // target -> key -> dep
  let despMap = targetMap.get(target);
  if (!despMap) {
    despMap = new Map();
    targetMap.set(target, despMap);
  }
  let dep = despMap.get(key);
  if (!dep) {
    dep = new Set();
    despMap.set(key, dep);
  }
  dep.add(activeEffect);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    effect.run();
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
  return _effect.run.bind(_effect);
}
