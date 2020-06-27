import { DtoBase } from './dto-base';

export interface DtoBaseForm<T extends DtoBase> {
  payload: T;
}
