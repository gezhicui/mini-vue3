//进行打包
const fs = require('fs');
const execa = require('execa');

const dirs = fs.readdirSync('packages').filter(p => {
  // 文件夹才进行打包
  if (!fs.statSync(`packages/${p}`).isDirectory()) {
    return false;
  }
  return true;
});

async function build(target) {
  // 注意 execa  -c 执行rullup配置 ， 环境变量 -env
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' }); // 子进程的输出在父包中输出
}

async function runParaller(dirs, itemfn) {
  //遍历
  let result = [];
  for (let item of dirs) {
    result.push(itemfn(item));
  }
  return Promise.all(result); // 存放打包的promise ,等待这里的打包执行完毕之后，调用成功
}

// 并发打包
runParaller(dirs, build).then(() => {
  //promise
  console.log('成功');
});
