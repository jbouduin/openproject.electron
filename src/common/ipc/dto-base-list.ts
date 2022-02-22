import { DtoBase } from './dto-base';

export interface DtoBaseList<T extends DtoBase> {
  total: number;
  count: number;
  pageSize?: number;
  offset?: number;
  items?: Array<T>;
}
