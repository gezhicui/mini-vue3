//进行打包
const fs = require('fs');
const execa = require('execa');

const dirs = fs.readdirSync('packages').filter(p => {
  // 判断是否是文件夹，是文件夹才进行打包
  if (!fs.statSync(`packages/${p}`).isDirectory()) {
    return false;
  }
  return true;
});

async function build(target) {
  // execa  -c 执行rullup配置 ， 环境变量 -env
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' }); // 子进程的输出在父包中输出
}

async function runParaller(dirs, itemfn) {
  //遍历
  let result = [];
  for (let item of dirs) {
    result.push(itemfn(item));
  }
  // 返回打包的promise
  return Promise.all(result);
}

// 并发打包
runParaller(dirs, build).then(() => {
  //promise.all执行完成  打包成功
  console.log('成功');
});
