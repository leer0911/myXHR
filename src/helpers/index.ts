import buildURL from './buildURL'
import parseHeaders from './parseHeaders'
import isURLSameOrigin from './isURLSameOrigin'
import cookies from './cookies'
import { forEach } from './utils'
import { AxiosTransformer } from '../type'

const isAbsoluteURL = (url: string): boolean => {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

const combineURLs = (baseURL: string, relativeURL: string): string => {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL
}

const normalizeHeaderName = (headers: any, normalizedName: string) => {
  forEach(headers, function processHeader (value: any, name: string) {
    if (
      name !== normalizedName &&
      name.toUpperCase() === normalizedName.toUpperCase()
    ) {
      headers[normalizedName] = value
      delete headers[name]
    }
  })
}

const transformData = (
  data: any,
  headers: any,
  fns: AxiosTransformer | AxiosTransformer[]
) => {
  forEach(fns, (fn: AxiosTransformer) => {
    data = fn(data, headers)
  })
  return data
}

export {
  isAbsoluteURL,
  combineURLs,
  normalizeHeaderName,
  transformData,
  buildURL,
  parseHeaders,
  isURLSameOrigin,
  cookies
}
