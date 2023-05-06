import { effect } from '../reactivity/effect';
import { EMPTY_OBJ } from '../shared/index';
import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  /**
   * @param n1 上一个虚拟节点
   * @param n2 现在的虚拟节点
   * @param container 父容器真实dom，用来挂载当前处理完的真实dom
   * @param parentComponent 父组件，用来传递provide数据
   * @param anchor dom diff 使用的锚点，用来处理虚拟节点的挂载位置
   */
  function patch(n1, n2, container, parentComponent, anchor) {
    // 判断当前传进来的节点是组件还是Vnode,组件的type是组件对象,需处理成Vnode后再回到patch处理
    const { type, shapeFlag } = n2;

    // Fragment -> 只渲染children
    switch (type) {
      // 空白占位节点
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      // 文本节点
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // dom元素节点
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件节点
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    console.log('processElement');
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      // update
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function processComponent(n1, n2: any, container: any, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement');
    console.log('n1', n1);
    console.log('n2', n2);
    // props
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);
    // children
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProps(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProps(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    const c1 = n1.children;
    const c2 = n2.children;

    // 新的是个文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 把老的 children 清空
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // 新clildren的是个数组
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // 旧的子节点是数组，新的子节点也是数组，进行diff
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  // diff 算法
  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    function isSomeVnodeType(n1, n2) {
      // type
      // key
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 3. 新的比老得多 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      // remove
      hostRemove(el);
    }
  }

  function mountComponent(initialVnode: any, container: any, parentComponent, anchor) {
    // instance的type属性存放组件的render和setup方法
    const instance = createComponentInstance(initialVnode, parentComponent);
    // 执行组件的setup,把return的对象挂载到instance.setupState属性上
    setupComponent(instance);
    // 开始执行组件的render方法,把组件构造成vnode
    setupRenderEffect(instance, initialVnode, container, anchor);
  }

  function setupRenderEffect(instance: any, initialVnode, container: any, anchor) {
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
    执行render成为subTree========>
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
    effect(() => {
      if (!instance.isMounted) {
        // instance.proxy存放了setup中return的对象数据
        const { proxy } = instance;
        // render中可以使用tis.xxx
        const subTree = (instance.subTree = instance.render.call(proxy));
        // console.log(subTree);
        // 组件处理成vnode了，重新返回去执行patch
        patch(null, subTree, container, instance, anchor);

        // 等组件处理完，就可以挂载el真实节点了
        initialVnode.el = subTree.el;
        // 把组件初始化标识打上，下次走更新逻辑
        instance.isMounted = true;
      } else {
        // update
        console.log('update');
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;

        instance.subTree = subTree;

        console.log('subTree', subTree);
        console.log('prevSubTree', prevSubTree);
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type));
    // 把el存到Vnode上
    vnode.el = el;
    const { props, children, shapeFlag } = vnode;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 子节点为文本 直接挂载
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 子节点还是vnode则递归挂载子节点
      mountChildren(children, el, parentComponent, anchor);
    }

    // 处理props
    for (const key in props) {
      // on + EventName
      const val = props[key];
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   el.addEventListener(key.slice(2).toLowerCase(), props[key]);
      // } else {
      //   el.setAttribute(key, props[key]);
      // }
      hostPatchProps(el, key, null, val);
    }
    // container.appendChild(el);
    hostInsert(el, container, anchor);
  }
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(child => {
      patch(null, child, container, parentComponent, anchor);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
