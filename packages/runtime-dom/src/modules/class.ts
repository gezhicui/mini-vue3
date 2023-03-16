//class   div  class =""    class
export const patchClass = (el, value) => {
  if (value == null) {
    value = '';
  }
  // 对这个标签的class 赋值 如果没有赋值为空 如果有新的覆盖
  el.className = value;
};
