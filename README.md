# chocolate

![build](https://img.shields.io/badge/build-passing-brightgreen)
![build](https://img.shields.io/badge/license-GPL-blue)

股票基金助手

一款界面美观、功能简约的课自定义添加股票和基金的助手，添加浏览器插件后，轻点右上角即可查看实时的财富动态。

## 技术栈

- vue-web-extension：https://github.com/Kocal/vue-web-extension/
- Ant Design Vue：https://github.com/vueComponent/ant-design-vue/

## 依赖版本

- **ant-design-vue**: 1.6.5
- **axios**: 0.21.1
- **vue**: 2.6.12

## 插件安装

- Chrome 插件商店安装：[下载地址](https://chrome.google.com/webstore/detail/%E8%82%A1%E7%A5%A8%E5%9F%BA%E9%87%91%E5%8A%A9%E6%89%8B/mebdnpnlnndmpeaomicjibfkhnjlbjgi?hl=zh-CN&authuser=0)
- Firefox 插件商店安装：[下载地址](https://addons.mozilla.org/zh-CN/firefox/addon/%E8%82%A1%E7%A5%A8%E5%9F%BA%E9%87%91%E5%8A%A9%E6%89%8B/?src=search)

## 快速开始

1. 下载源码

   ```
   git clone git@github.com:YYJeffrey/chocolate.git
   ```

2. 安装依赖  
   请确保您的 Node.js>=10，npm>=5，并使用`npm install`安装所需依赖。

3. 运行项目  
   如果你需要进行二次开发可以使用`npm run watch`进行热编译部署，如果你只需要打包则运行`npm run build`。

## 数据源

- 股票数据源：[东方财富网](https://www.eastmoney.com/)
- 基金数据源：[天天基金网](https://fund.eastmoney.com/)

## 产品展示

<img src="./screenshot/p1.png" width="520px" /><br/>
<img src="./screenshot/p2.png" width="520px" /><br/>
<img src="./screenshot/p3.png" width="520px" /><br/>
<img src="./screenshot/p4.png" width="520px" /><br/>

特别鸣谢：ICON 来源——by@我是一台图标制造机（iconfont@iconchan）

## 更新记录

### v0.1.0

- 新增下拉搜索
- 新增分时图显示
- 修复自选不显示问题
- 更新版本依赖

### v0.0.5

- 火狐插件正式上架，历经艰难险阻最终还是回来了

### v0.0.4

- 修复交互细节
- 解决了火狐插件商城发布问题

### v0.0.3

- 切换了数据源，提升了响应性能
- 修复由缓存导致的 bug

### v0.0.2

- 修复已知影响使用的 bug

### v0.0.1

- 完成主要业务功能发布第一版插件
