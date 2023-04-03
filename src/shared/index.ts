// 合并对象
export const extend = Object.assign;

// 判断是否是对象
export const isObject = val => {
  return val !== null && typeof val === 'object';
};

// 判断是否改变
export const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue);
};

// 判断是否有参数
export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

// 中横线转驼峰
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
};

// 首字母大写
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 构造on+Evnetname
export const toHandlerKey = (str: string) => {
  return str ? `on${capitalize(str)}` : '';
};
