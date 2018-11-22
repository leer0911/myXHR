import {
  forEach,
  isArray,
  isArrayBuffer,
  isArrayBufferView,
  isBlob,
  isDate,
  isFormData,
  isFunction,
  isNumber,
  isObject,
  isString,
  isURLSearchParams,
  trim
} from '../src/helpers/utils'

describe('src/helpers/utils Is.. ：', function () {
  it('should validate Array', function () {
    expect(isArray([])).toEqual(true)
    expect(isArray({ length: 5 })).toEqual(false)
  })

  it('should validate ArrayBuffer', function () {
    expect(isArrayBuffer(new ArrayBuffer(2))).toEqual(true)
    expect(isArrayBuffer({})).toEqual(false)
  })

  it('should validate ArrayBufferView', function () {
    expect(isArrayBufferView(new DataView(new ArrayBuffer(2)))).toEqual(true)
  })

  it('should validate FormData', function () {
    expect(isFormData(new FormData())).toEqual(true)
  })

  it('should validate Blob', function () {
    expect(isBlob(new Blob())).toEqual(true)
  })

  it('should validate String', function () {
    expect(isString('')).toEqual(true)
    expect(isString({ toString: function () { return '' } })).toEqual(false)
  })

  it('should validate Number', function () {
    expect(isNumber(123)).toEqual(true)
    expect(isNumber('123')).toEqual(false)
  })

  it('should validate Object', function () {
    expect(isObject({})).toEqual(true)
    expect(isObject(null)).toEqual(false)
  })

  it('should validate Date', function () {
    expect(isDate(new Date())).toEqual(true)
    expect(isDate(Date.now())).toEqual(false)
  })

  it('should validate Function', function () {
    expect(isFunction(() => { return })).toEqual(true)
    expect(isFunction('function')).toEqual(false)
  })

  it('should validate URLSearchParams', function () {
    expect(isURLSearchParams(new URLSearchParams())).toEqual(true)
    expect(isURLSearchParams('foo=1&bar=2')).toEqual(false)
  })
})

describe('src/helpers/utils forEach', function () {
  it('should loop over an array', function () {
    let sum = 0

    forEach([ 1, 2, 3, 4, 5 ], function (val: number) {
      sum += val
    })

    expect(sum).toEqual(15)
  })

  it('should loop over object keys', function () {
    let keys = ''
    let vals = 0
    const obj = {
      b: 1,
      a: 2,
      r: 3
    }

    forEach(obj, function (v: any, k: string) {
      keys += k
      vals += v
    })

    expect(keys).toEqual('bar')
    expect(vals).toEqual(6)
  })

  it('should handle undefined gracefully', function () {
    let count = 0

    forEach(undefined, function () {
      count++
    })

    expect(count).toEqual(0)
  })

  it('should make an array out of non-array argument', function () {
    let count = 0

    forEach(function () { return }, function () {
      count++
    })

    expect(count).toEqual(1)
  })

  it('should handle non object prototype gracefully', function () {
    let count = 0
    const data = Object.create(null)
    data.foo = 'bar'

    forEach(data, function () {
      count++
    })

    expect(count).toEqual(1)
  })
})

describe('src/helpers/utils trim', function () {
  it('should trim spaces', function () {
    expect(trim('  foo  ')).toEqual('foo')
  })

  it('should trim tabs', function () {
    expect(trim('\tfoo\t')).toEqual('foo')
  })
})
