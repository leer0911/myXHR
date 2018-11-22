import defaults from '../config/defaults'
import { isCancel } from '../cancel/index'
import { AxiosAdapter, AxiosRequestConfig } from '../type'
import { combineURLs, isAbsoluteURL, transformData } from '../helpers/index'

const throwIfCancellationRequested = (config: AxiosRequestConfig) => {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}

const dispatchRequest = (config: AxiosRequestConfig) => {
  throwIfCancellationRequested(config)
  if (!defaults.adapter) {
    return undefined
  }
  const adapter: AxiosAdapter = config.adapter || defaults.adapter
  const {
    headers,
    baseURL,
    data,
    url = '',
    transformRequest = [],
    transformResponse = [],
    method = 'get'
  } = config

  const suportBaseURL = () => {
    return baseURL && !isAbsoluteURL(url) ? combineURLs(baseURL, url) : url
  }
  const flattenHeaders = () => {
    // 使用 ES6 rest 与 解构赋值 过滤 header 的一些属性
    const {
      delete: DELETE,
      get,
      head,
      post,
      patch,
      common = {},
      ...filterHeaders
    } = headers
    const contentType = headers[method] || {}
    return {
      ...common,
      ...contentType,
      ...filterHeaders
    }
  }

  const requestData: AxiosRequestConfig = {
    ...config,
    url: suportBaseURL(),
    data: transformData(data, headers, transformRequest),
    headers: flattenHeaders()
  }

  return adapter(requestData).then(
    (response) => {
      throwIfCancellationRequested(config)
      const { data, headers } = response
      response.data = transformData(data, headers, transformResponse)

      return response
    },
    (reason) => {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config)
        const {
          response,
          response: { data, headers }
        } = reason
        if (reason && response) {
          reason.response.data = transformData(
            data,
            headers,
            transformResponse
          )
        }
      }

      return Promise.reject(reason)
    }
  )
}

export default dispatchRequest
