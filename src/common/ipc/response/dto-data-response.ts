import { DataStatus } from './data-status';

export interface DtoDataResponse<T> {
  status: DataStatus,
  data?: T,
  message?: string
}
