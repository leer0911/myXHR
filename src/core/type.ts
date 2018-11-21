export interface AxiosRequestConfig {
  url?: string
  method?: string
  baseURL?: string
  xsrfCookieName?: string
  xsrfHeaderName?: string
  headers?: any
  params?: any
  data?: any
  timeout?: number
  withCredentials?: boolean
  responseType?: XMLHttpRequestResponseType
  paramsSerializer?: (params: any) => string
  onUploadProgress?: (progressEvent: any) => void
  onDownloadProgress?: (progressEvent: any) => void
  validateStatus?: (status: number) => boolean
  adapter?: AxiosAdapter
  auth?: AxiosBasicCredentials
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  cancelToken?: CancelToken
}

export interface AxiosAdapter {
  (config: AxiosRequestConfig): AxiosPromise<any>
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> { }

export interface AxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request?: any
}

export interface AxiosBasicCredentials {
  username: string
  password: string
}

export interface AxiosTransformer {
  (data: any, headers?: any): any
}

export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  throwIfRequested (): void
}

export interface Cancel {
  message: string
}
