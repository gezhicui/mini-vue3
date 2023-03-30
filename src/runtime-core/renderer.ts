import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from './component';

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断当前传进来的节点是组件还是Vnode,组件的type是组件对象,需处理成Vnode后再回到patch处理
  if (typeof vnode.type === 'string') {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVnode: any, container: any) {
  // instance的type属性存放组件的render和setup方法
  const instance = createComponentInstance(initialVnode);
  // 执行组件的setup,把结果挂载到instance.setupState属性上
  setupComponent(instance);
  // 开始执行组件的render方法,把组件构造成vnode
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance: any, initialVnode, container: any) {
  /*
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard'],
      },
      [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
    );
  },
  执行render成为========>
  {
    type: 'div',
    props: {
      id: 'root',
      class: ['red', 'hard'],
    },
    children: [
      {
        type: 'p',
        props: {
          class: 'red',
        },
        children: 'hi',
      },
      {
        type: 'p',
        props: {
          class: 'blue',
        },
        children: 'mini-vue',
      },
    ],
  }
  */
  // instance.proxy存放了setup中return的对象数据
  const { proxy } = instance;
  // render中可以使用tis.xxx
  const subTree = instance.render.call(proxy);
  console.log(subTree);
  // 组件处理成vnode了，重新返回去执行patch
  patch(subTree, container);

  // 等组件处理完，就可以挂载el真实节点了
  initialVnode.el = subTree.el;
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  // 把el存到Vnode上
  vnode.el = el;
  const { props, children } = vnode;

  if (typeof children === 'string') {
    // 子节点为文本 直接挂载
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // 子节点还是vnode则递归挂载子节点
    mountChildren(children, el);
  }

  // 处理props
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  container.appendChild(el);
}

function mountChildren(children, container) {
  children.forEach(child => {
    patch(child, container);
  });
}
