import { forEach, trim } from './utils'

const ignoreDuplicateOf = [
  'age',
  'authorization',
  'content-length',
  'content-type',
  'etag',
  'expires',
  'from',
  'host',
  'if-modified-since',
  'if-unmodified-since',
  'last-modified',
  'location',
  'max-forwards',
  'proxy-authorization',
  'referer',
  'retry-after',
  'user-agent'
]

const parseHeaders = (headers: any) => {
  const parsed: any = {}

  if (!headers) {
    return parsed
  }
  forEach(headers.split('\n'), function parser (line: string) {
    const strIndex = line.indexOf(':')
    const key = trim(line.substr(0, strIndex)).toLowerCase()
    const val = trim(line.substr(strIndex + 1))

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([ val ])
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val
      }
    }
  })
  return parsed
}

export default parseHeaders
