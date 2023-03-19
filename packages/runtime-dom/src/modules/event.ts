/**
 * 事件改变 如@cilck='fn'  变为@cilck='fn1'
 * @param el 节点
 * @param key 事件名称  如onClick
 * @param value 绑定的事件函数
 */
export const patchEvent = (el, key, value) => {
  // 使用el._vei对函数进行缓存
  const invokers = el._vei || (el._vei = {});
  const exists = invokers[key];
  // 如果已经绑定了事件切事件发生了改变
  if (exists && value) {
    exists.value = value;
  } else {
    //获取事件名称
    const eventName = key.slice(2).toLowerCase();

    if (value) {
      // 有新的事件 创建方法
      let invoker = (invokers[eventName] = createInvoker(value));
      el.addEventListener(eventName, invoker); //添加事件
    } else {
      // 没有新的事件   把以前绑定的删除
      el.removeEventLister(eventName, exists);
      invokers[eventName] = undefined; //清除缓存
    }
  }
};

function createInvoker(value) {
  const invoker = e => {
    invoker.value(e);
  };
  invoker.value = value;
  return invoker;
}

//  事件的处理

//1 给元素缓存一个绑定的事件列表
//2如果缓存中没有 ，并且value 有值 需要绑定方法并缓存掐了
//3以前绑定过 需要删除，缓存也缓存
//4 两个都有  直接改变invoker中的value 指向最新的事件
