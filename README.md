# 实现最简 Vue3

vue3 的极简实现，只对核心模块进行实现

# 目录结构

```
├─example（示例html文件,可直接运行查看各个模块的效果）
├─packages（核心包，Vue的各种方法的实现）
│  ├─mock （纯前端mock接口配置文件夹）
├─scripts 构建方法
│  ├─reactivity 响应式包 包含响应式原理的实现
│  ├─runtime-dom 提供了常用的节点操作api和属性操作的api
│  ├─runtime-core 包含虚拟dom的创建，diff算法等
│  ├─shared 一些通用的函数
├─.gitignore git忽略文件
package.json 工程信息文件
rollup.config.js rollup打包配置文件
```
