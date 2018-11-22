import { AxiosError, AxiosRequestConfig, AxiosResponse } from '../type'

const enhanceError = (
  error: any,
  config: AxiosRequestConfig,
  code: string,
  request?: any,
  response?: AxiosResponse
): AxiosError => {
  if (code) {
    error.code = code
  }
  error.config = config
  error.request = request
  error.response = response
  error.isAxiosError = true
  error.toJSON = function () {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    }
  }

  return error
}

export default enhanceError
