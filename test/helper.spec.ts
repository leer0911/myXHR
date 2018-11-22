import * as sinon from 'sinon'
import {
  buildURL,
  combineURLs,
  isAbsoluteURL,
  isURLSameOrigin,
  normalizeHeaderName,
  parseHeaders
} from '../src/helpers/index'

describe('helpers/buildURL', function () {
  it('should support null params', function () {
    expect(buildURL('/foo')).toEqual('/foo')
  })

  it('should support params', function () {
    expect(
      buildURL('/foo', {
        foo: 'bar'
      })
    ).toEqual('/foo?foo=bar')
  })

  it('should support object params', function () {
    expect(
      buildURL('/foo', {
        foo: {
          bar: 'baz'
        }
      })
    ).toEqual('/foo?foo=' + encodeURI('{"bar":"baz"}'))
  })

  it('should support date params', function () {
    const date = new Date()

    expect(
      buildURL('/foo', {
        date: date
      })
    ).toEqual('/foo?date=' + date.toISOString())
  })

  it('should support array params', function () {
    expect(
      buildURL('/foo', {
        foo: [ 'bar', 'baz' ]
      })
    ).toEqual('/foo?foo[]=bar&foo[]=baz')
  })

  it('should support special char params', function () {
    expect(
      buildURL('/foo', {
        foo: '@:$, '
      })
    ).toEqual('/foo?foo=@:$,+')
  })

  it('should support existing params', function () {
    expect(
      buildURL('/foo?foo=bar', {
        bar: 'baz'
      })
    ).toEqual('/foo?foo=bar&bar=baz')
  })

  it('should support "length" parameter', function () {
    expect(
      buildURL('/foo', {
        query: 'bar',
        start: 0,
        length: 5
      })
    ).toEqual('/foo?query=bar&start=0&length=5')
  })

  it('should correct discard url hash mark', function () {
    expect(
      buildURL('/foo?foo=bar#hash', {
        query: 'baz'
      })
    ).toEqual('/foo?foo=bar&query=baz')
  })

  it('should use serializer if provided', function () {
    const serializer = sinon.stub()
    const params = { foo: 'bar' }
    serializer.returns('foo=bar')
    expect(buildURL('/foo', params, serializer)).toEqual('/foo?foo=bar')
    expect(serializer.calledOnce).toBe(true)
    expect(serializer.calledWith(params)).toBe(true)
  })

  it('should support URLSearchParams', function () {
    expect(buildURL('/foo', new URLSearchParams('bar=baz'))).toEqual(
      '/foo?bar=baz'
    )
  })
})

describe('helpers/combineURLs', function () {
  it('should combine URLs', function () {
    expect(combineURLs('https://api.github.com', '/users')).toBe(
      'https://api.github.com/users'
    )
  })

  it('should remove duplicate slashes', function () {
    expect(combineURLs('https://api.github.com/', '/users')).toBe(
      'https://api.github.com/users'
    )
  })

  it('should insert missing slash', function () {
    expect(combineURLs('https://api.github.com', 'users')).toBe(
      'https://api.github.com/users'
    )
  })

  it('should not insert slash when relative url missing/empty', function () {
    expect(combineURLs('https://api.github.com/users', '')).toBe(
      'https://api.github.com/users'
    )
  })

  it('should allow a single slash for relative url', function () {
    expect(combineURLs('https://api.github.com/users', '/')).toBe(
      'https://api.github.com/users/'
    )
  })
})

describe('helpers/isAbsoluteURL', function () {
  it('should return true if URL begins with valid scheme name', function () {
    expect(isAbsoluteURL('https://api.github.com/users')).toBe(true)
    expect(isAbsoluteURL('custom-scheme-v1.0://example.com/')).toBe(true)
    expect(isAbsoluteURL('HTTP://example.com/')).toBe(true)
  })

  it('should return false if URL begins with invalid scheme name', function () {
    expect(isAbsoluteURL('123://example.com/')).toBe(false)
    expect(isAbsoluteURL('!valid://example.com/')).toBe(false)
  })

  it('should return true if URL is protocol-relative', function () {
    expect(isAbsoluteURL('//example.com/')).toBe(true)
  })

  it('should return false if URL is relative', function () {
    expect(isAbsoluteURL('/foo')).toBe(false)
    expect(isAbsoluteURL('foo')).toBe(false)
  })
})

describe('helpers/isURLSameOrigin', function () {
  it('should detect same origin', function () {
    expect(isURLSameOrigin(window.location.href)).toEqual(true)
  })

  it('should detect different origin', function () {
    expect(isURLSameOrigin('https://github.com/axios/axios')).toEqual(false)
  })
})

describe('helpers/normalizeHeaderName', function () {
  it('should normalize matching header name', function () {
    const headers: any = {
      'conTenT-Type': 'foo/bar'
    }
    normalizeHeaderName(headers, 'Content-Type')
    expect(headers['Content-Type']).toBe('foo/bar')
    expect(headers['conTenT-Type']).toBeUndefined()
  })

  it('should not change non-matching header name', function () {
    const headers: any = {
      'content-type': 'foo/bar'
    }
    normalizeHeaderName(headers, 'Content-Length')
    expect(headers['content-type']).toBe('foo/bar')
    expect(headers['Content-Length']).toBeUndefined()
  })
})

describe('helpers/parseHeaders', function () {
  it('should parse headers', function () {
    const date = new Date()
    const parsed = parseHeaders(
      'Date: ' +
        date.toISOString() +
        '\n' +
        'Content-Type: application/json\n' +
        'Connection: keep-alive\n' +
        'Transfer-Encoding: chunked'
    )

    expect(parsed['date']).toEqual(date.toISOString())
    expect(parsed['content-type']).toEqual('application/json')
    expect(parsed['connection']).toEqual('keep-alive')
    expect(parsed['transfer-encoding']).toEqual('chunked')
  })

  it('should use array for set-cookie', function () {
    const parsedZero = parseHeaders('')
    const parsedSingle = parseHeaders('Set-Cookie: key=val;')
    const parsedMulti = parseHeaders(
      'Set-Cookie: key=val;\n' + 'Set-Cookie: key2=val2;\n'
    )

    expect(parsedZero['set-cookie']).toBeUndefined()
    expect(parsedSingle['set-cookie']).toEqual([ 'key=val;' ])
    expect(parsedMulti['set-cookie']).toEqual([ 'key=val;', 'key2=val2;' ])
  })

  it('should handle duplicates', function () {
    const parsed = parseHeaders(
      'Age: age-a\n' + // age is in ignore duplicates blacklist
        'Age: age-b\n' +
        'Foo: foo-a\n' +
        'Foo: foo-b\n'
    )

    expect(parsed['age']).toEqual('age-a')
    expect(parsed['foo']).toEqual('foo-a, foo-b')
  })
})
