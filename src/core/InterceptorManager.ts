import { Interceptor } from '../type'

export default class InterceptorManager {
  handlers: any[] = []
  use (fulfilled: (data: any) => any, rejected: (error: any) => any) {
    this.handlers.push({ fulfilled, rejected })
    return this.handlers.length - 1
  }
  eject (id: number) {
    if (this.handlers[id]) {
      this.handlers[id] = null
    }
  }
  forEach (fn: (handle: Interceptor) => void) {
    this.handlers.forEach((handle) => {
      if (handle !== null) {
        fn(handle)
      }
    })
  }
}
