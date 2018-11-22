import { isNumber, isStandardBrowserEnv, isString } from './utils'

const standardBrowserEnv = {
  write (
    name: string,
    value: string,
    expires?: number,
    path?: string,
    domain?: string,
    secure?: boolean
  ) {
    const cookie = []

    cookie.push(`${name}=${encodeURIComponent(value)}`)

    if (expires && isNumber(expires)) {
      cookie.push(`expires=${new Date(expires).toUTCString()}`)
    }

    if (isString(path)) {
      cookie.push(`path=${path}`)
    }

    if (isString(domain)) {
      cookie.push(`domain=${domain}`)
    }

    if (secure === true) {
      cookie.push('secure')
    }

    document.cookie = cookie.join('; ')
  },

  read (name: string) {
    const match = document.cookie.match(
      new RegExp(`(^|;\\s*)(${name})=([^;]*)`)
    )
    return match ? decodeURIComponent(match[3]) : null
  },

  remove (name: string) {
    this.write(name, '', Date.now() - 86400000)
  }
}

const nonStandardBrowserEnv = {
  write () { return null },
  read (): null {
    return null
  },
  remove () { return null }
}

const cookies = isStandardBrowserEnv()
  ? standardBrowserEnv
  : nonStandardBrowserEnv

export default cookies
