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
  auth?: any
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
  username?: string
  password?: string
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

export interface Interceptor {
  fulfilled: (data: any) => any
  rejected: (error: any) => any
}

export interface AxiosError extends Error {
  config: AxiosRequestConfig
  code?: string
  request?: any
  response?: AxiosResponse
  isAxiosError: boolean
}
export interface AxiosReslove {
  (value?: AxiosResponse<any> | PromiseLike<AxiosResponse<any>>): void
}

export interface CancelStatic {
  new (message?: string): Cancel
}

export interface Cancel {
  message: string
}

export interface Canceler {
  (message?: string): void
}

export interface CancelTokenStatic {
  new (executor: (cancel: Canceler) => void): CancelToken
  source (): CancelTokenSource
}

export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}
