import { AxiosRequestConfig } from './type'

export default class Axios {
  defaults: AxiosRequestConfig
  constructor (instanceConfig: AxiosRequestConfig) {
    this.defaults = instanceConfig
  }
}
