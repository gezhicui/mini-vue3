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

console.log(dirs);
