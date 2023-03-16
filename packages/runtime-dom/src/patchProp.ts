//  属性操作
import { patchClass } from './modules/class';
import { patchStyle } from './modules/style';
import { patchAttr } from './modules/attr';
import { patchEvent } from './modules/event';
/**
 * 计算节点属性差异
 * @param el 节点
 * @param key 节点属性 如class,style,事件等
 * @param prevValue 旧值
 * @param nextValue 新值
 */
export const patchProps = (el, key, prevValue, nextValue) => {
  switch (key) {
    case 'class':
      patchClass(el, nextValue);
      break;
    case 'style':
      patchStyle(el, prevValue, nextValue);
      break;
    default:
      if (/^on[^a-z]/.test(key)) {
        // 事件处理 e.g. onClick
        patchEvent(el, key, nextValue);
      } else {
        patchAttr(el, key, nextValue);
      }
      break;
  }
};
