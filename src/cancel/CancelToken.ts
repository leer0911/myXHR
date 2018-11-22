import Cancel from './Cancel'
import { Canceler } from '../type'

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  constructor (executor: (cancel: Canceler) => void) {
    if (!executor) {
      throw new TypeError('executor must be a function.')
    }
    const token = this
    let resolvePromise: any

    this.promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    executor(function cancel (message) {
      if (token.reason) {
        return
      }
      message && (token.reason = new Cancel(message))
      resolvePromise(token.reason)
    })
  }
  static source () {
    let cancel
    const token = new CancelToken((c) => {
      cancel = c
    })
    return {
      token: token,
      cancel: cancel
    }
  }
  throwIfRequested () {
    if (this.reason) {
      throw this.reason
    }
  }
}
