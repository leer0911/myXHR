import InterceptorManager from './InterceptorManager'
import dispatchRequest from './dispatchRequest'
import { AxiosRequestConfig, Interceptor } from '../type'

export default class Axios {
  defaults: AxiosRequestConfig
  interceptors: {
    request: InterceptorManager;
    response: InterceptorManager;
  }
  constructor (instanceConfig: AxiosRequestConfig) {
    this.defaults = instanceConfig
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    }
  }

  request (config: AxiosRequestConfig = {}) {
    const { method } = config
    const newConfig: AxiosRequestConfig = {
      ...this.defaults,
      ...config,
      method: method ? method.toLowerCase() : 'get'
    }

    // 拦截器原理：[请求拦截器,发送请求,响应拦截器] 顺序执行

    const chain = [ dispatchRequest, undefined ]

    let promise: any = Promise.resolve(newConfig)

    this.interceptors.request.forEach((interceptor: Interceptor) => {
      chain.unshift(interceptor.fulfilled, interceptor.rejected)
    })
    this.interceptors.response.forEach((interceptor: Interceptor) => {
      chain.push(interceptor.fulfilled, interceptor.rejected)
    })

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift())
    }

    return promise
  }

  delete (url: string, config = {}) {
    return this.request(Object.assign(config, { method: 'delete', url }))
  }
  get (url: string, config = {}) {
    return this.request(Object.assign(config, { method: 'get', url }))
  }
  head (url: string, config = {}) {
    return this.request(Object.assign(config, { method: 'head', url }))
  }
  options (url: string, config = {}) {
    return this.request(Object.assign(config, { method: 'options', url }))
  }
  post (url: string, data: any, config = {}) {
    return this.request(Object.assign(config, { method: 'post', url, data }))
  }
  put (url: string, data: any, config = {}) {
    return this.request(Object.assign(config, { method: 'put', url, data }))
  }
  patch (url: string, data: any, config = {}) {
    return this.request(Object.assign(config, { method: 'patch', url, data }))
  }
}
