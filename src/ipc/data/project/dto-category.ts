import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';

export type DtoCategoryList = DtoBaseList<DtoCategory>;

export interface DtoCategory extends DtoBase{
  name: string;
}
