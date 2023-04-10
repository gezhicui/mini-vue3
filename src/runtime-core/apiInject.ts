import { getCurrentInstance } from './component';

export function provide(key, val) {
  // 存
  // key value
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;

    // 在createComponentInstance方法中，初始化时provides= parent.provides
    if (provides === parentProvides) {
      // 借助原型链向上查找实现provide
      /* e.g
        var person1 = {
          name: '张三',
          age: 38,
          greeting: function() {
            console.log('Hi! I\'m ' + this.name + '.');
          }
        };
        var person2 = Object.create(person1);
        person2.name='person2'
        person2.age='123'
        var person3 = Object.create(person2);
      */
      provides = currentInstance.provides = Object.create(parentProvides);
    }

    provides[key] = val;
  }
}

export function inject(key, defaultValue) {
  // 取
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    // key in obj会沿着对象的原型链寻找所有的键值
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue();
      } else {
        return defaultValue;
      }
    }
  }
}
