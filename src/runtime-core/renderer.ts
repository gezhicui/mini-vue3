import { effect } from '../reactivity/effect';
import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  // n1是上一个虚拟节点，n2是现在的虚拟节点
  function patch(n1, n2, container, parentComponent) {
    // 判断当前传进来的节点是组件还是Vnode,组件的type是组件对象,需处理成Vnode后再回到patch处理
    const { type, shapeFlag } = n2;

    // Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
      console.log('processElement  mount');
    } else {
      // update
      patchElement(n1, n2, container);
      console.log('processElement  update');
    }
  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function patchElement(n1, n2, container) {
    console.log('patchElement');
    console.log('n1', n1);
    console.log('n2', n2);

    // props

    // children
  }

  function mountComponent(initialVnode: any, container: any, parentComponent) {
    // instance的type属性存放组件的render和setup方法
    const instance = createComponentInstance(initialVnode, parentComponent);
    // 执行组件的setup,把return的对象挂载到instance.setupState属性上
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
        patch(null, subTree, container, instance);

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
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type));
    // 把el存到Vnode上
    vnode.el = el;
    const { props, children, shapeFlag } = vnode;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 子节点为文本 直接挂载
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 子节点还是vnode则递归挂载子节点
      mountChildren(children, el, parentComponent);
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
      hostPatchProps(el, key, val);
    }
    // container.appendChild(el);
    hostInsert(el, container);
  }
  function mountChildren(children, container, parentComponent) {
    children.forEach(child => {
      patch(null, child, container, parentComponent);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
