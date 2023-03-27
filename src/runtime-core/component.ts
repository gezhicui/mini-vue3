export function createComponentInstance(vnode) {
  const component = {
    vnode,
  };
  return component;
}

export function setupComponent(instance) {
  // 1. initprops
  // 2. initslots
  // 3. initsetup
  setupStatefulComponent(instance);
  // 4. render
  // 5. effect
}

function setupStatefulComponent(instance) {
  const Component = instance.vnode.type;
  const { setup } = Component;
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;
  instance.render = Component.render;
}
