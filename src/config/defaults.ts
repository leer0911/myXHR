import XHR from '../adapters/xhr'
import { AxiosRequestConfig } from '../type'
import { normalizeHeaderName } from '../helpers/index'
import {
  isArrayBuffer,
  isArrayBufferView,
  isBlob,
  isFile,
  isFormData,
  isObject,
  isStream,
  isURLSearchParams
} from '../helpers/utils'

const DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
}

const setContentTypeIfUnset = (headers: any, value: string) => {
  if (!headers && !headers['Content-Type']) {
    headers['Content-Type'] = value
  }
}

const getDefaultAdapter = () => {
  return XHR
}

const headers = (): any => {
  const emptyMethod = [ 'delete', 'get', 'head' ].reduce((obj, key) => {
    return Object.assign(obj, { [key]: {} })
  }, {})

  const mergeMethod = [ 'post', 'put', 'patch' ].reduce((obj, key) => {
    return Object.assign(obj, { [key]: { ...DEFAULT_CONTENT_TYPE } })
  }, {})

  return {
    common: {
      Accept: 'application/json, text/plain, */*'
    },
    ...emptyMethod,
    ...mergeMethod
  }
}

const transformRequest = () => {
  return [
    (data: any, headers: any) => {
      normalizeHeaderName(headers, 'Accept')
      normalizeHeaderName(headers, 'Content-Type')

      if (
        isFormData(data) ||
        isArrayBuffer(data) ||
        isStream(data) ||
        isFile(data) ||
        isBlob(data)
      ) {
        return data
      }
      if (isArrayBufferView(data)) {
        return data.buffer
      }
      if (isURLSearchParams(data)) {
        setContentTypeIfUnset(
          headers,
          'application/x-www-form-urlencoded;charset=utf-8'
        )
        return data.toString()
      }
      if (isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8')
        return JSON.stringify(data)
      }
      return data
    }
  ]
}

const transformResponse = () => {
  return [
    (data: string) => {
      try {
        data = JSON.parse(data)
      } catch (e) {
        console.log(e)
      }
      return data
    }
  ]
}

const defaults: AxiosRequestConfig = {
  headers: headers(),
  adapter: getDefaultAdapter(),
  transformRequest: transformRequest(),
  transformResponse: transformResponse(),
  timeout: 0,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  validateStatus (status: number) {
    return status >= 200 && status < 300
  }
}

export default defaults
