const toString = Object.prototype.toString

const isArray = (val: any) => {
  return toString.call(val) === '[object Array]'
}

const isArrayBuffer = (val: any) => {
  return toString.call(val) === '[object ArrayBuffer]'
}

const isFormData = (val: any) => {
  return FormData && val instanceof FormData
}

const isArrayBufferView = (val: any) => {
  let result
  if (ArrayBuffer && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val)
  } else {
    result = val && val.buffer && val.buffer instanceof ArrayBuffer
  }
  return result
}

const isString = (val: any) => {
  return typeof val === 'string'
}

const isNumber = (val: any) => {
  return typeof val === 'number'
}

const isUndefined = (val: any) => {
  return typeof val === 'undefined'
}

const isObject = (val: any) => {
  return val !== null && typeof val === 'object'
}

const isDate = (val: any) => {
  return toString.call(val) === '[object Date]'
}

const isFile = (val: any) => {
  return toString.call(val) === '[object File]'
}

const isBlob = (val: any) => {
  return toString.call(val) === '[object Blob]'
}

const isFunction = (val: any) => {
  return toString.call(val) === '[object Function]'
}

const isStream = (val: any) => {
  return isObject(val) && isFunction(val.pipe)
}

const isURLSearchParams = (val: any) => {
  return (
    URLSearchParams && val instanceof URLSearchParams
  )
}

const isStandardBrowserEnv = () => {
  if (
    navigator &&
    (navigator.product === 'ReactNative' ||
      navigator.product === 'NativeScript' ||
      navigator.product === 'NS')
  ) {
    return false
  }

  return window && document
}

const trim = (str: string) => {
  return str.replace(/^\s*/, '').replace(/\s*$/, '')
}

const forEach = (obj: any, fn: any) => {
  if (obj === null || typeof obj === 'undefined') {
    return
  }
  if (typeof obj !== 'object') {
    obj = [ obj ]
  }
  if (isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      fn.call(null, obj[i], i, obj)
    }
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj)
      }
    }
  }
}

export {
  isArray,
  isArrayBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isObject,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isFunction,
  isStream,
  isURLSearchParams,
  isStandardBrowserEnv,
  trim,
  forEach
}
