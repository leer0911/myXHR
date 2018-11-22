import { AxiosRequestConfig } from '../type'
import { isObject } from '../helpers/utils'

export function mergeDeep (target: any, ...sources: any): object {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

const mergeConfig = (
  source: AxiosRequestConfig,
  target: AxiosRequestConfig = {}
) => {
  const merge = mergeDeep(source, target)

  const deepCopy = (obj: any) => {
    const clone: any = {}
    for (const i in obj) {
      if (isObject(obj[i])) {
        clone[i] = deepCopy(obj[i])
      } else {
        clone[i] = obj[i]
      }
    }
    return clone
  }

  const cloneObject = deepCopy(merge)

  return cloneObject
}

export default mergeConfig
