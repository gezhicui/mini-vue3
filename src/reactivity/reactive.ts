import { mutableHandlers, readonlyHandlers } from './baseHandlers';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactive(raw: any) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw: any) {
  return createActiveObject(raw, readonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadOnly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
