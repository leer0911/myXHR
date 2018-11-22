export default class Cancel {
  message: string
  __CANCEL__: boolean = true
  constructor (message: string) {
    this.message = message
  }
  toString () {
    return `Cancel${this.message ? ': ' + this.message : ''}`
  }
}
