# myXHR

又是一篇关于 TypeScript 的分享，上次用 TypeScript 重构 Vconsole 的[项目](https://juejin.im/post/5bf278295188252e89668ed2) 埋下了对 [Axios](https://github.com/axios/axios) 源码解析的梗。于是，这次分享的主题就是 **如何从零用 TypeScript 重构 Axios 以及为什么我要这么做**。

## 教程

[TypeScript 重构 Axios 全攻略](https://github.com/leer0911/myXHR/blob/master/doc/README.md)

## 特性

- √ 从浏览器创建 XMLHttpRequest
- √ 支持 Promise API
- √ 拦截请求和响应
- √ 转换请求和响应数据
- √ 取消请求
- √ 自动转换 JSON 数据
- √ 客户端支持防止 XSRF

## 开始

```bash
# 安装依赖
yarn

# 开发及调试
yarn dev

# 构建
yarn build

# 测试
yarn test
```

欢迎各位重构，相互交流!
