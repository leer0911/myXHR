# TypeScript 重构 Axios 全攻略

拒绝做一个只会用 API 的文档工程师，本文将会让你从重复造轮子的过程中掌握 web 开发相关的基本知识。

又是一篇关于 TypeScript 的分享，年底了，请允许我沉淀一下。上次用 TypeScript 重构 Vconsole 的[项目](https://juejin.im/post/5bf278295188252e89668ed2) 埋下了对 [Axios](https://github.com/axios/axios) 源码解析的梗。于是，这次分享的主题就是 **如何从零用 TypeScript 重构 Axios 以及为什么我要这么做**。

笔者在用 TypeScript 重复造轮子的时候目的还是很明确的，**不仅是为了用 TypeScript 养成一种好的开发习惯，更重要的是了解工具库关联的基础知识。** 只有更多地注重基础知识，才能早日摆脱文档工程师的困扰。(Ps: 用 TypeScript，也是为了摆脱前端查文档的宿命!)

本次分享包括以下内容：

- 工程简介 & 开发技巧
- API 实现
- 设计模式的应用
- XHR，XHR，XHR
- HTTP，HTTP，HTTP
- 单元测试

## 工程简介

Axios 是什么?

> Promise based HTTP client for the browser and node.js

axios 是基于 Promise 用于浏览器和 nodejs 的 HTTP 客户端，它本身具有以下特性 ( √ 表示本项目具备该特性 )：

- √ 从浏览器创建 XMLHttpRequest
- √ 支持 Promise API
- √ 拦截请求和响应
- √ 转换请求和响应数据
- √ 取消请求
- √ 自动转换 JSON 数据
- √ 客户端支持防止 CSRF/XSRF
- × 从 node.js 发出 http 请求

这里主要讲解浏览器端的 XHR 实现，限于篇幅不会涉及 node 下的 http 。如果你愿意一层一层了解它，你会发现实现 axios 还是很简单的，来一起探索吧！

### 目录说明

首先来看下目录。

![](./img/dir.png)

目录与 Axios 基本保持一致，core 是 `Axios` 类的核心代码。adapters 是 XHR 核心实现，Cancel 是与 取消请求相关的代码。helpers 用于放常用的工具函数。`Karma.conf.js` 及 test 目录与单元测试相关。`.travis.yml` 用于配置[ 在线持续集成](https://travis-ci.org/)，另外可在 github 的 README  文件配置构建情况。

### Parcel 集成

打包工具选用的是 [Parcel](https://parceljs.org/)，目的是零配置编译 TypeScript 。入口文件为 src 目录下的 `index.html`，只需在  入口文件里引入 `index.ts` 即可完成热更新，TypeScript 编译等配置：

```html
<body>
  <script src="index.ts"></script>
</body>
```

Parcel 相关：

```bash
# 全局安装
yarn global add parcel-bundler

# 启动服务
parcel ./src/index.html

# 打包
parcel build ./src/index.ts
```

### vscode 调试

运行完 parcel 命令会启动一个本地服务器，可以通过 `.vscode` 目录下的 `launch.json` 配置 Vscode 调试工具。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Lanzar Chrome contra localhost",
      "url": "http://localhost:1234",
      "webRoot": "${workspaceRoot}",
      "sourceMaps": true,
      "breakOnLoad": true,
      "sourceMapPathOverrides": {
        "../*": "${webRoot}/*"
      }
    }
  ]
}
```

配置完成后，可断点调试，按 F5 即可开始调试。

![](./img/debugging.png)

## TypeScript 配置

TypeScript 整体配置和规范检测参考如下：

- [tsconfig.json](https://www.tslang.cn/docs/handbook/tsconfig-json.html)

- [tslint](https://palantir.github.io/tslint/)

强烈建议开启 `tslint` ，安装 vscode [tslint 插件](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) 并在 `.vscode` 目录下的 `.setting` 配置如下格式:

```json
{
  "editor.tabSize": 2,
  "editor.rulers": [120],
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true
  },
  "eslint.enable": false,
  "tslint.autoFixOnSave": true,
  "typescript.format.enable": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

如果有安装 [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)需注意两者风格冲突，无论格式化代码的插件是什么，我们的目的只有一个，就是  保证代码格式化风格统一。（ 最好遵循 lint 规范 ）。

**ps：`.vscode` 目录可随 git 跟踪进版本管理，这样可以让  clone 仓库的使用者更友好。**

另外可以通过，vscode 的 **控制面板中的问题 tab** 迅速查看当前项目问题所在。

![](./img/error.png)

## TypeScript 代码片段测试

我们时常会有想要编辑某段测试代码，又不想在项目里编写的需求(比如用 TypeScript 写一个 deepCopy 函数)，不想脱离 vscode 编辑器的话，推荐使用 [quokka](https://marketplace.visualstudio.com/items?itemName=WallabyJs.quokka-vscode)，一款可立即执行脚本的插件。

![](./img/type.png)

- 如果需要导入其他库可参考[quokka 配置](https://quokkajs.com/docs/configuration.html#global-config-file)
- 希望引入浏览器环境，可在 quokkajs 项目目录全局安装[jsdom-quokka-plugin](https://github.com/wallabyjs/jsdom-quokka-plugin)插件

接着像这样

```ts
({
  plugins: 'jsdom-quokka-plugin',
  jsdom: { html: `<div id="test">Hello</div>` }
});

const testDiv = document.getElementById('test');

console.log(testDiv.innerHTML);
```

![](./img/quokka.png)

## API 概览

重构的思路首先是看文档提供的 API，或者 `index.d.ts` 声明文件。 优秀一点的源码可以看它的测试用例，一般会提供 API 相关的测试，如 [Axios API 测试用例](https://github.com/axios/axios/blob/master/test/specs/api.spec.js) ，本次分享实现 API 如下：

![](./img/api.png)

总得下来就是五类 API，比葫芦娃还少。有信心了吧，我们来一个个"送人头"。

## Axios 类

这些 API 可以统称为实例方法，有实例，就肯定有类。所以再讲 API 实现之前，先让我们  来看一下 Axios 类。

![](./img/axios.png)

两个属性（defaults，interceptors），一个通用方法（ request ，其余都是基于 request，只是参数不同 ）真的不能再简单了。

```ts
export default class Axios {
  defaults: AxiosRequestConfig;
  interceptors: {
    request: InterceptorManager;
    response: InterceptorManager;
  };
  request(config: AxiosRequestConfig = {}) {
    // 请求相关
  }
  // 由 request 延伸出 get 、post 等
}
```

## axios 实例

Axios 库默认导出的是 Axios 的一个实例 axios，而不是 Axios 类本身。但是，这里并没有直接返回 Axios 的实例，而是将 Axios 实例方法 request 的上下文设置为了 Axios。 所以 axios 的类型是 function，不是 object。但由于 function 也是 Object 所以可以设置属性和方法。于是 axios 既可以表现的像实例，又可以直接调用 `axios(config)`。具体实现如下：

```ts
const createInstance = (defaultConfig: AxiosRequestConfig) => {
  const context = new Axios(defaultConfig);
  const instance = Axios.prototype.request.bind(context);
  extend(instance, Axios.prototype, context);
  extend(instance, context);
  return instance;
};

axios.create = (instanceConfig: AxiosRequestConfig) => {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

const axios: AxiosExport = createInstance(defaults);

axios.Axios = Axios;

export default axios;
```

axios 还提供了一个 Axios 类的属性，可供别的类继承。另外暴露了一个工厂函数，接收一个配置项参数，方便使用者创建多个不同配置的请求实例。

## default config

如果不看源码，我们用一个类，最关心的应该是构造函数，默认设置了什么属性，以及我们可以修改哪些属性。体现在 Axios 就是，请求的默认配置。

下面我们来看下默认配置：

```ts
const defaults: AxiosRequestConfig = {
  headers: headers(), // 请求头
  adapter: getDefaultAdapter(), // XMLHttpRequest 发送请求的具体实现
  transformRequest: transformRequest(), // 自定义处理请求相关数据，默认有提供一个修改根据请求的 data 修改 content-type 的方法。
  transformResponse: transformResponse(), // 自定义处理响应相关数据，默认提供了一个将 respone 数据转换为 JSON格式的方法
  timeout: 0,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  validateStatus(status: number) {
    return status >= 200 && status < 300;
  }
};
```

这边先讲一些数据处理以及适配相关的配置，接下来把与请求相关的配置详细介绍一遍。

## AxiosRequestConfig

先来看下 axios 接受的请求参数都有哪些属性，以下参数属性均是可选的。使用 TypeScript 事先定义了这些参数的类型，接下来传参的时候就可以检验传参的类型是否正确。

```ts
export interface AxiosRequestConfig {
  url?: string; // 请求链接
  method?: string; // 请求方法
  baseURL?: string; // 请求的基础链接
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  headers?: any;
  params?: any;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: XMLHttpRequestResponseType;
  paramsSerializer?: (params: any) => string;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  validateStatus?: (status: number) => boolean;
  adapter?: AxiosAdapter;
  auth?: any;
  transformRequest?: AxiosTransformer | AxiosTransformer[];
  transformResponse?: AxiosTransformer | AxiosTransformer[];
  cancelToken?: CancelToken;
}
```

#### url & method & baseURL

```ts
export interface AxiosRequestConfig {
  url?: string; // 请求链接
  method?: string; // 请求方法
  baseURL?: string; // 请求的基础链接
}
```

先来看下相关知识：

url，method 作为 [XMLHttpRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest) 中 [open](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/open) 方法的参数。

> open 语法： `xhrReq.open(method, url, async, user, password);`

url 是一个 [DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)，表示发送请求的 URL。

**注意：将 null | undefined 传递给接受 DOMString 的方法或参数时通常会把其 stringifies 为 “null” | “undefined”**

用原生的 open 方法传递如下参数，实际请求 URL 如下：

```js
let xhr = new XMLHttpRequest();

// 假设当前 window.location.host 为 http://localhost:1234

xhr.open('get', ''); // http://localhost:1234/
xhr.open('get', '/'); // href http://localhost:1234/
xhr.open('get', null); // http://localhost:1234/null
xhr.open('get', undefined); // http://localhost:1234/undefined
```

可以看到默认 baseURL 为 `window.location.host` 类似 `http://localhost:1234/undefined` 这种 URL 请求成功的情况是存在的。当前端动态传递 url 参数时，参数是有可能为 `null` 或 `undefined` ，如果不是通过 response 的状态码来响应操作，此时得到的结果就跟预想的不一样。**这让我想起了，JavaScript 隐式转换的坑，比比皆是。(此处安利 TypeScript 和 '===' 操作符)**

![](./img/badrequest.png)

对于这种情况，使用 TypeScript 可以在开发阶段规避这些问题。但如果是动态赋值(比如请求返回的结果作为 url 参数时)，需要给值判断下类型，必要时可抛出错误或转换为其他想要的值。

接着来看下 axios url 相关，主要提供了 baseURL 的支持，可以通过 `axios.defaults.baseURL` 或 `axios({baseURL:'...'})`

```ts
const isAbsoluteURL = (url: string): boolean => {
  // 1、判断是否为协议形式比如 http://
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};
const combineURLs = (baseURL: string, relativeURL: string): string => {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};
const suportBaseURL = () => {
  // 2、baseURL 处理
  return baseURL && !isAbsoluteURL(url) ? combineURLs(baseURL, url) : url;
};
```

## HTTP 请求方法

axios 提供配置 HTTP 请求的方法：

```ts
export interface AxiosRequestConfig {
  method?: string;
}
```

可选配置如下:

- GET：请求一个指定资源的表示形式. 使用 GET 的请求应该只被用于获取数据.
- HEAD：HEAD 方法请求一个与 GET 请求的响应相同的响应，但没有响应体.
- POST：用于将实体(data)提交到指定的资源，通常导致状态或服务器上的副作用的更改.
- PUT：用请求有效载荷替换目标资源的所有当前表示。
- DELETE：删除指定的资源。
- OPTIONS：用于描述目标资源的通信选项。
- PATCH：用于对资源应用部分修改。

接着了解下 **HTTP 请求**

> HTTP 定义了一组请求方法, 以表明要对给定资源执行的操作。指示针对给定资源要执行的期望动作. 虽然他们也可以是名词, 但这些请求方法有时被称为 HTTP 动词. 每一个请求方法都实现了不同的语义, 但一些共同的特征由一组共享：: 例如一个请求方法可以是 safe, idempotent, 或 cacheable.

- safe：说一个 HTTP 方法是安全的，是说这是个不会修改服务器的数据的方法。也就是说，这是一个对服务器只读操作的方法。这些方法是安全的：GET，HEAD 和 OPTIONS。有些不安全的方法如 PUT 和 DELETE 则不是。

- idempotent：一个 HTTP 方法是幂等的，指的是同样的请求被执行一次与连续执行多次的效果是一样的，服务器的状态也是一样的。换句话说就是，幂等方法不应该具有副作用（统计用途除外）。在正确实现的条件下，GET，HEAD，PUT 和 DELETE 等方法都是幂等的，而 POST 方法不是。所有的 safe 方法也都是幂等的。

- cacheable：可缓存的，响应是可被缓存的 HTTP 响应，它被存储以供稍后检索和使用，从而将新的请求保存在服务器。

篇幅有限，[看 MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods)

## HTTP 请求头

axios 提供配置 HTTP 请求头的方法：

```ts
export interface AxiosRequestConfig {
  headers?: any;
}
```

一个请求头由名称（不区分大小写）后跟一个冒号“：”，冒号后跟具体的值（不带换行符）组成。该值前面的引导空白会被忽略。

![](./img/requestHeader.png)

> 请求头可以被定义为：被用于 http 请求中并且和请求主体无关的那一类 HTTP header。某些请求头如 `Accept`, `Accept-*`, ` If-*``允许执行条件请求。某些请求头如：Cookie `, `User-Agent` 和 `Referer` 描述了请求本身以确保服务端能返回正确的响应。

**并非所有出现在请求中的 http 首部都属于请求头，例如在 POST 请求中经常出现的 `Content-Length` 实际上是一个代表请求主体大小的 entity header，虽然你也可以把它叫做请求头。**

[消息头列表](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers)

axios 根据请求方法 设置了不同的 `Content-Type` 和 `Accpect` 请求头。

### 设置请求头

XMLHttpRequest 对象提供的 `XMLHttpRequest对象提供的.setRequestHeader()` 方法为开发者提供了一个操作这两种头部信息的方法，并允许开发者自定义请求头的头部信息。

默认情况下，当发送 AJAX 请求时，会附带以下头部信息：

axios 设置代码如下：

```ts
// 在 adapters 目录下的 xhr.ts 文件中：
if ('setRequestHeader' in requestHeaders) {
  // 通过 XHR 的 setRequestHeader 方法设置请求头信息
  for (const key in requestHeaders) {
    if (requestHeaders.hasOwnProperty(key)) {
      const val = requestHeaders[key];
      if (
        typeof requestData === 'undefined' &&
        key.toLowerCase() === 'content-type'
      ) {
        delete requestHeaders[key];
      } else {
        request.setRequestHeader(key, val);
      }
    }
  }
}
```

## 理解 CSRF(跨站请求伪造)

与 CSRF 相关的配置属性有这三个：

```Ts
export interface AxiosRequestConfig {
  xsrfCookieName?: string
  xsrfHeaderName?: string
  withCredentials?: boolean;
}

// 默认配置为
{
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withCredentials: false
}
```

那么，先来简单了解 **CSRF**

> 跨站请求伪造（英语：Cross-site request forgery），也被称为 one-click attack 或者 session riding，通常缩写为 CSRF 或者 XSRF， 是一种挟制用户在当前已登录的 Web 应用程序上执行非本意的操作的攻击方法。跟[跨网站脚本](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC)（XSS）相比，XSS 利用的是用户对指定网站的信任，CSRF 利用的是网站对用户网页浏览器的信任。

### 什么是 CSRF 攻击?

你这可以这么理解 CSRF 攻击：攻击者盗用了你的身份，以你的名义发送恶意请求。CSRF 能够做的事情包括：以你名义发送邮件，发消息，盗取你的账号，甚至于购买商品，虚拟货币转账。造成的问题包括：个人隐私泄露以及财产安全。

### CSRF 原理

在他们的钓鱼站点，攻击者可以通过创建一个 AJAX 按钮或者表单来针对你的网站创建一个请求：

```html
<form action="https://my.site.com/me/something-destructive" method="POST">
  <button type="submit">Click here for free money!</button>
</form>
```

要完成一次 CSRF 攻击，受害者必须依次完成两个步骤：

1.登录受信任网站 A，并在本地生成 Cookie。

2.在不登出 A 的情况下，访问危险网站 B。

### 如果减轻 CSRF 攻击？

### 只使用 JSON api

使用 JavaScript 发起 AJAX 请求是限制跨域的。 不能通过一个简单的 `<form>` 来发送 `JSON`， 所以，通过只接收 JSON，你可以降低发生上面那种情况的可能性。

### 禁用 CORS

第一种减轻 CSRF 攻击的方法是禁用 cross-origin requests(跨域请求)。如果你希望允许跨域请求，那么请只允许 `OPTIONS, HEAD, GET` 方法，因为他们没有副作用。不幸的是，这不会阻止上面的请求由于它没有使用 JavaScript(因此 CORS 不适用)。

### 检查 Referer 字段

HTTP 头中有一个 Referer 字段，这个字段用以标明请求来源于哪个地址。在处理敏感数据请求时，通常来说，Referer 字段应和请求的地址位于同一域名下。这种办法简单易行，工作量低，仅需要在关键访问处增加一步校验。但这种办法也有其局限性，因其完全依赖浏览器发送正确的 Referer 字段。虽然 http 协议对此字段的内容有明确的规定，但并无法保证来访的浏览器的具体实现，亦无法保证浏览器没有安全漏洞影响到此字段。并且也存在攻击者攻击某些浏览器，篡改其 Referer 字段的可能。(**PS:可见遵循 web 标准多么重要**)

### CSRF Tokens

最终的解决办法是使用 CSRF tokens。 CSRF tokens 是如何工作的呢？

1. 服务器发送给客户端一个 token。
2. 客户端提交的表单中带着这个 token。
3. 如果这个 token 不合法，那么服务器拒绝这个请求。

攻击者需要通过某种手段获取你站点的 CSRF token， 他们只能使用 JavaScript 来做。 所以，如果你的站点不支持 CORS， 那么他们就没有办法来获取 CSRF token， 降低了威胁。

**确保 CSRF token 不能通过 AJAX 访问到!**

不要创建一个`/CSRF`路由来获取一个 token， 尤其不要在这个路由上支持 CORS!

token 需要是不容易被猜到的， 让它很难被攻击者尝试几次得到。 它不需要是密码安全的。 攻击来自从一个未知的用户的一次或者两次的点击， 而不是来自一台服务器的暴力攻击。

### axios 中的 CSRF Tokens

这里有个 `withCredentials` ，先来了解下。

> XMLHttpRequest.withCredentials 属性是一个 Boolean 类型，它指示了是否该使用类似 cookies,authorization headers(头部授权)或者 TLS 客户端证书这一类资格证书来创建一个跨站点访问控制（cross-site Access-Control）请求。在同一个站点下使用 withCredentials 属性是无效的。

> 如果在发送来自其他域的 XMLHttpRequest 请求之前，未设置 withCredentials 为 true，那么就不能为它自己的域设置 cookie 值。而通过设置 withCredentials 为 true 获得的第三方 cookies，将会依旧享受同源策略，因此不能被通过 document.cookie 或者从头部相应请求的脚本等访问。

```ts
// 在标准浏览器环境下 (非 web worker 或者 react-native) 则添加 xsrf 头
if (isStandardBrowserEnv()) {
  // 必须在 withCredentials 或 同源的情况，才设置 xsrfHeader 头
  const xsrfValue =
    (withCredentials || isURLSameOrigin(url)) && xsrfCookieName
      ? cookies.read(xsrfCookieName)
      : undefined;
  if (xsrfValue && xsrfHeaderName) {
    requestHeaders[xsrfHeaderName] = xsrfValue;
  }
}
```

总结一下，对于 CSRF，需要让后端同学，敏感的请求不要使用类似 get 这种幂等的，但是由于 Form 表单发起的 POST 请求并不受 CORS 的限制，因此可以任意地使用其他域的 Cookie 向其他域发送 POST 请求，形成 CSRF 攻击。

这时，如果有涉及敏感信息的请求，需要跟后端同学配合，进行 XSRF-Token 认证。此时，我们用 axios 请求的时候，就可以通过设置 `XMLHttpRequest.withCredentials=true` 以及设置 `axios({xsrfCookieName:'',xsrfHeaderName:''})`，不使用则会用默认的 `XSRF-TOKEN` 和 `X-XSRF-TOKEN`(拿这个跟后端配合即可)。

所以，axios 特性中，客户端支持防止 CSRF/XSRF。只是方便设置 CORF-TOKEN ，关键还是要后端同学的接口支持。（**PS:前后端相亲相爱多重要，所以作为前端的我们还是尽可能多了解这方面的知识**）

## 参考

- [跨站请求伪造](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0)

- [跨站脚本](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC)

- [HTTP 请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods)
