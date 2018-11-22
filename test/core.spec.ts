import settle from '../src/core/settle'
import mergeConfig from '../src/core/mergeConfig'
import defaults from '../src/config/defaults'

describe('core/settle', function () {
  let resolve: any
  let reject: any

  beforeEach(function () {
    resolve = jasmine.createSpy('resolve')
    reject = jasmine.createSpy('reject')
  })

  it('should resolve promise if status is not set', function () {
    const response: any = {
      config: {
        validateStatus: function () {
          return true
        }
      }
    }
    settle(resolve, reject, response)
    expect(resolve).toHaveBeenCalledWith(response)
    expect(reject).not.toHaveBeenCalled()
  })

  it('should resolve promise if validateStatus is not set', function () {
    const response: any = {
      status: 500,
      config: {}
    }
    settle(resolve, reject, response)
    expect(resolve).toHaveBeenCalledWith(response)
    expect(reject).not.toHaveBeenCalled()
  })

  it('should resolve promise if validateStatus returns true', function () {
    const response: any = {
      status: 500,
      config: {
        validateStatus: function () {
          return true
        }
      }
    }
    settle(resolve, reject, response)
    expect(resolve).toHaveBeenCalledWith(response)
    expect(reject).not.toHaveBeenCalled()
  })

  it('should reject promise if validateStatus returns false', function () {
    const req = {
      path: '/foo'
    }
    const response: any = {
      status: 500,
      config: {
        validateStatus: function () {
          return false
        }
      },
      request: req
    }
    settle(resolve, reject, response)
    expect(resolve).not.toHaveBeenCalled()
    expect(reject).toHaveBeenCalled()
    const reason = reject.calls.first().args[0]
    expect(reason instanceof Error).toBe(true)
    expect(reason.message).toBe('Request failed with status code 500')
    expect(reason.config).toBe(response.config)
    expect(reason.request).toBe(req)
    expect(reason.response).toBe(response)
  })

  it('should pass status to validateStatus', function () {
    const validateStatus = jasmine.createSpy('validateStatus')
    const response: any = {
      status: 500,
      config: {
        validateStatus: validateStatus
      }
    }
    settle(resolve, reject, response)
    expect(validateStatus).toHaveBeenCalledWith(500)
  })
})

describe('core/mergeConfig', function () {
  it('should not leave references', function () {
    const merged = mergeConfig(defaults, {})
    expect(merged).not.toBe(defaults)
    expect(merged.headers).not.toBe(defaults.headers)
  })

  it('should allow setting request options', function () {
    const config = {
      url: '__sample url__',
      method: '__sample method__',
      params: '__sample params__',
      data: { foo: true }
    }
    const merged = mergeConfig(defaults, config)
    expect(merged.url).toEqual(config.url)
    expect(merged.method).toEqual(config.method)
    expect(merged.params).toEqual(config.params)
    expect(merged.data).toEqual(config.data)
  })

  it('should merge auth, headers, proxy with defaults', function () {
    expect(
      mergeConfig(
        { auth: undefined },
        { auth: { username: 'foo', password: 'test' } }
      )
    ).toEqual({
      auth: { username: 'foo', password: 'test' }
    })
    expect(
      mergeConfig(
        { auth: { username: 'foo', password: 'test' } },
        { auth: { password: 'foobar' } }
      )
    ).toEqual({
      auth: { username: 'foo', password: 'foobar' }
    })
  })

  it('should overwrite auth, headers, proxy with a non-object value', function () {
    expect(
      mergeConfig({ auth: { username: 'foo', password: 'test' } }, { auth: false })
    ).toEqual({
      auth: false
    })
    expect(
      mergeConfig({ auth: { username: 'foo', password: 'test' } }, { auth: null })
    ).toEqual({
      auth: null
    })
  })

  it('should allow setting other options', function () {
    const merged = mergeConfig(defaults, { timeout: 123 })
    expect(merged.timeout).toEqual(123)
  })
})
