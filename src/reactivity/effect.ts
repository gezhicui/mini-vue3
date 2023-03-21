import { extend } from '../shared';

let activeEffect;
let shouldTrack;

class ReactiveEffect {
  private _fn: any;
  deps = [];
  // onStop是用户传入的stop方法的回调函数
  onStop?: () => void;
  active = true;
  // 加上public关键字外部可直接通过 实例.scheduler来访问内容
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    // 当前effect执行，activeEffect指向当前effect，为依赖收集做准备
    activeEffect = this;
    return this._fn();
  }
  stop() {
    // 优化性能，多次stop只执行一次
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
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
  if (!activeEffect) return;
  dep.add(activeEffect);
  activeEffect?.deps.push(dep);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // 把传入的options放到_effect上去
  extend(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
