import { ShapeFlags } from '../shared/shapeFlags';

export function initSlots(instance, children) {
  const { vnode } = instance;
  // 判断当前是不是一个slot节点
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children, slots) {
  // 有插槽的组件children是个对象，对象的key是插槽名,value是渲染函数
  for (const key in children) {
    const value = children[key];
    // 把组件slot渲染函数返回结果包装成数组,h函数就可以解析数组子节点)
    slots[key] = props => normalizeSlotValue(value(props));
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
