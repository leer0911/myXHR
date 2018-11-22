import enhanceError from './enhanceError'
import { AxiosRequestConfig, AxiosResponse } from '../type'

const createError = (
  message: string,
  config: AxiosRequestConfig,
  code: string,
  request: any,
  response?: AxiosResponse
) => {
  const error = new Error(message)
  return enhanceError(error, config, code, request, response)
}

export default createError
