// e.g {style；{color:"red"}} => {style；{background:red,size:20px;}}
export const patchStyle = (el, prev, next) => {
  // 获取节点style
  const style = el.style;
  // 新的style为null  直接删除节点的style属性
  if (next == null) {
    el.removeAttribute('style');
  } else {
    // 删除不用的属性
    if (prev) {
      for (let key in prev) {
        if (next[key] == null) {
          //清空
          style[key] = '';
        }
      }
    }

    // 添加新的属性
    for (let key in next) {
      style[key] = next[key];
    }
  }
};
