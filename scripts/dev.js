const execa = require('execa');

// 并行开始打包reactivity目录并监听（开发环境）
async function build(target) {
  // 注意 execa  -c 执行rullup配置 ， 环境变量 -env  w
  await execa(
    'rollup',
    ['-cw', '--environment', `TARGET:${target}`],
    // 子进程的输出在父包中输出
    { stdio: 'inherit' }
  );
}

// build('reactivity');
build('runtime-dom');
