import { forEach, isArray, isDate, isObject, isURLSearchParams } from './utils'

const encode = (val: any) => {
  return encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

const buildURL = (
  url: string,
  params?: any,
  paramsSerializer?: (params: any) => any
) => {
  if (!params) {
    return url
  }

  let serializedParams

  // 试用策略模式改写深层 if-else 嵌套
  const hasSerializerFn = typeof paramsSerializer === 'function'
  const isURLSearch = isURLSearchParams(params)
  const isNormal = !hasSerializerFn && !isURLSearch

  const methodsMap: any = {
    hasSerializerFn () {
      if (!hasSerializerFn || !paramsSerializer) {
        return
      }
      return paramsSerializer(params)
    },
    isURLSearch () {
      if (!isURLSearch) {
        return
      }
      return params.toString()
    },
    isNormal () {
      if (!isNormal) {
        return undefined
      }
      const parts: string[] = []

      forEach(params, function serialize (val: any, key: string) {
        if (val === null || typeof val === 'undefined') {
          return
        }

        if (isArray(val)) {
          key = key + '[]'
        } else {
          val = [ val ]
        }

        forEach(val, function parseValue (v: any) {
          if (isDate(v)) {
            v = v.toISOString()
          } else if (isObject(v)) {
            v = JSON.stringify(v)
          }
          parts.push(encode(key) + '=' + encode(v))
        })
      })

      return parts.join('&')
    }
  }

  for (const key in methodsMap) {
    if (methodsMap.hasOwnProperty(key)) {
      const methodsMapFn = methodsMap[key]
      if (!serializedParams) {
        serializedParams = methodsMapFn()
      }
    }
  }

  if (serializedParams) {
    const hashmarkIndex = url.indexOf('#')
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}

export default buildURL
