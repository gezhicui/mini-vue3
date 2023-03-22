import { extend } from '../shared';

// 当前正在执行的effect，需要被作为依赖收集起来
let activeEffect;
// 是否应该要触发依赖
let shouldTrack;

class ReactiveEffect {
  private _fn: any;
  deps = [];
  // onStop是用户传入的stop方法的回调函数
  onStop?: () => void;
  // 当前effect是否需要触发依赖更新（当effect调用了stop，则后续不触发依赖更新）
  active = true;
  // 加上public关键字外部可直接通过 实例.scheduler来访问内容
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    // 如果当前effect已经stop了，则不把shouldTrack设置为true，这样在get时不会进行依赖收集
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    // 当前effect执行，activeEffect指向当前effect，为依赖收集做准备
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    return result;
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
  effect.deps.length = 0;
}

const targetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;
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

  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect?.deps.push(dep);
}
export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
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
