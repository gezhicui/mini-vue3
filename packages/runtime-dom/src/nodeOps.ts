//操作节点  增删改查元素和文本
export const nodeOps = {
  // 创建元素
  createElement: tagName => document.createElement(tagName),
  // 删除元素
  remove: child => {
    let parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  // 插入元素
  insert: (child, parent, ancher = null) => {
    parent.insertBefore(child, ancher); // ancher = null appendchild
  },
  querySlecter: select => document.querySelector(select),

  // 文本
  setElementText: (el, text) => (el.textConent = text),
  createText: text => document.createTextNode(text),
  setText: (node, text) => (node.nodeValue = text),
};
