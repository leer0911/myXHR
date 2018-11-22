import { Cancel, CancelToken, isCancel } from '../src/cancel'

describe('isCancel', function () {
  it('returns true if value is a Cancel', function () {
    expect(isCancel(new Cancel(''))).toBe(true)
  })

  it('returns false if value is not a Cancel', function () {
    expect(isCancel({ foo: 'bar' })).toBe(false)
  })
})

describe('Cancel', function () {
  describe('toString', function () {
    it('returns correct result when message is not specified', function () {
      const cancel = new Cancel('')
      expect(cancel.toString()).toBe('Cancel')
    })

    it('returns correct result when message is specified', function () {
      const cancel = new Cancel('Operation has been canceled.')
      expect(cancel.toString()).toBe('Cancel: Operation has been canceled.')
    })
  })
})

describe('CancelToken', function () {
  describe('reason', function () {
    it('returns a Cancel if cancellation has been requested', function () {
      let cancel: any
      const token = new CancelToken(function (c) {
        cancel = c
      })
      cancel('Operation has been canceled.')
      const reason: any = token.reason
      expect(reason).toEqual(jasmine.any(Cancel))
      expect(reason.message).toBe('Operation has been canceled.')
    })

    it('returns undefined if cancellation has not been requested', function () {
      const token = new CancelToken(function () {
        return
      })
      expect(token.reason).toBeUndefined()
    })
  })

  describe('promise', function () {
    it('returns a Promise that resolves when cancellation is requested', function (done) {
      let cancel: any
      const token = new CancelToken(function (c) {
        cancel = c
      })
      token.promise.then(function onFulfilled (value) {
        expect(value).toEqual(jasmine.any(Cancel))
        expect(value.message).toBe('Operation has been canceled.')
        done()
      })
      cancel('Operation has been canceled.')
    })
  })

  describe('throwIfRequested', function () {
    it('throws if cancellation has been requested', function () {
      // Note: we cannot use expect.toThrowError here as Cancel does not inherit from Error
      let cancel: any
      const token = new CancelToken(function (c) {
        cancel = c
      })
      cancel('Operation has been canceled.')
      try {
        token.throwIfRequested()
        fail('Expected throwIfRequested to throw.')
      } catch (thrown) {
        if (!(thrown instanceof Cancel)) {
          fail(
            'Expected throwIfRequested to throw a Cancel, but it threw ' +
              thrown +
              '.'
          )
        }
        expect(thrown.message).toBe('Operation has been canceled.')
      }
    })

    it('does not throw if cancellation has not been requested', function () {
      const token = new CancelToken(function () {
        return
      })
      token.throwIfRequested()
    })
  })
  describe('source', function () {
    it('returns an object containing token and cancel function', function () {
      const source: any = CancelToken.source()
      expect(source.token).toEqual(jasmine.any(CancelToken))
      expect(source.cancel).toEqual(jasmine.any(Function))
      expect(source.token.reason).toBeUndefined()
      source.cancel('Operation has been canceled.')
      expect(source.token.reason).toEqual(jasmine.any(Cancel))
      expect(source.token.reason.message).toBe('Operation has been canceled.')
    })
  })
})
