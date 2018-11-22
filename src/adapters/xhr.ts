import settle from '../core/settle'
import createError from '../core/createError'
import { isFormData, isStandardBrowserEnv } from '../helpers/utils'
import { AxiosPromise, AxiosRequestConfig } from '../type'
import {
  buildURL,
  cookies,
  isURLSameOrigin,
  parseHeaders
} from '../helpers/index'

const xhrAdapter = (config: AxiosRequestConfig): AxiosPromise => {
  return new Promise((resolve, reject) => {
    const {
      headers: requestHeaders,
      data: requestData,
      method = 'get',
      url = '',
      params,
      paramsSerializer,
      auth,
      timeout,
      withCredentials,
      responseType,
      onDownloadProgress,
      onUploadProgress,
      cancelToken,
      xsrfHeaderName,
      xsrfCookieName
    } = config
    let request: XMLHttpRequest | null = new XMLHttpRequest()

    const setHeaders = () => {
      if (!request) {
        return
      }
      // 如果是 FormData 的形式则让浏览器自行定义 Content-Type
      if (isFormData(requestData)) {
        delete requestHeaders['Content-Type']
      }

      // 设置 Authorization
      if (auth) {
        const { username = '', password = '' } = auth
        requestHeaders.Authorization =
          'Basic ' + btoa(username + ':' + password)
      }

      // 在标准浏览器环境下 (非 web worker 或者 react-native) 则添加 xsrf 头
      if (isStandardBrowserEnv()) {
        const xsrfValue =
          (withCredentials || isURLSameOrigin(url)) && xsrfCookieName
            ? cookies.read(xsrfCookieName)
            : undefined
        if (xsrfValue && xsrfHeaderName) {
          requestHeaders[xsrfHeaderName] = xsrfValue
        }
      }

      // 通过 XHR 的 setRequestHeader 方法设置请求头信息
      if ('setRequestHeader' in requestHeaders) {
        for (const key in requestHeaders) {
          if (requestHeaders.hasOwnProperty(key)) {
            const val = requestHeaders[key]
            if (
              typeof requestData === 'undefined' &&
              key.toLowerCase() === 'content-type'
            ) {
              delete requestHeaders[key]
            } else {
              request.setRequestHeader(key, val)
            }
          }
        }
      }
    }

    const setXHR = () => {
      if (!request) {
        return
      }

      timeout && (request.timeout = timeout)

      request.onreadystatechange = () => {
        if (!request || request.readyState !== 4) {
          return
        }
        const {
          status,
          responseURL,
          responseText,
          response,
          statusText
        } = request

        // 请求使用 file 协议，部分浏览器会返回 status 为 0 ( 即使请求成功 )
        if (
          status === 0 &&
          !(responseURL && responseURL.indexOf('file:') === 0)
        ) {
          return
        }

        // 这边必须使用 request.getAllResponseHeaders ，否则报 Uncaught TypeError: Illegal invocation
        const responseHeaders =
          'getAllResponseHeaders' in request
            ? parseHeaders(request.getAllResponseHeaders())
            : null

        const responseData =
          !responseType || responseType === 'text' ? responseText : response

        const newResponse = {
          data: responseData,
          status: status,
          statusText: statusText,
          headers: responseHeaders,
          config: config,
          request: request
        }

        settle(resolve, reject, newResponse)

        // Clean up request
        request = null
      }
      request.onabort = () => {
        if (!request) {
          return
        }

        reject(createError('Request aborted', config, 'ECONNABORTED', request))

        // Clean up request
        request = null
      }
      request.onerror = () => {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, '', request))

        request = null
      }
      request.ontimeout = () => {
        reject(
          createError(
            `timeout of ${timeout} ms exceeded`,
            config,
            'ECONNABORTED',
            request
          )
        )

        request = null
      }

      if (cancelToken) {
        cancelToken.promise.then((cancel) => {
          if (!request) {
            return
          }
          request.abort()
          reject(cancel)
          request = null
        }).catch((err) => {
          console.error(err)
        })
      }
      if (withCredentials) {
        // 不同域下的 XmlHttpRequest 响应，不论其 Access-Control-header 设置什么值，
        // 都无法为它自身站点设置 cookie 值，除非它在请求之前将 withCredentials 设为 true。
        request.withCredentials = true
      }
      if (responseType) {
        try {
          request.responseType = responseType
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (responseType !== 'json') {
            throw e
          }
        }
      }
      if (typeof onDownloadProgress === 'function') {
        request.addEventListener('progress', onDownloadProgress)
      }
      if (typeof onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', onUploadProgress)
      }
    }

    const openXHR = () => {
      if (!request) {
        return
      }
      request.open(
        method.toUpperCase(),
        buildURL(url, params, paramsSerializer),
        true
      )
    }

    const sendXHR = () => {
      if (!request) {
        return
      }
      request.send(requestData || null)
    }

    setHeaders()
    openXHR()
    setXHR()
    sendXHR()
  })
}

export default xhrAdapter
