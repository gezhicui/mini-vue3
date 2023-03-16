//自定的属性  e.g: a =1   a=3
export const patchAttr = (el, key, value) => {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};
