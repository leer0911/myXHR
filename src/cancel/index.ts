import Cancel from './Cancel'
import CancelToken from './CancelToken'

const isCancel = (value: any) => {
  return !!(value && value.__CANCEL__)
}

export { isCancel, Cancel, CancelToken }
