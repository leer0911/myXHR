import { AxiosRequestConfig } from '../type'

const mergeConfig = (
  source: AxiosRequestConfig,
  target: AxiosRequestConfig = {}
) => {
  return {
    ...source,
    ...target
  }
}

export default mergeConfig
