import { DtoBase } from '../dto-base';
import { DtoCategoryList } from './dto-category-list';

export interface DtoProject extends DtoBase {
  categories?: DtoCategoryList;
  description: string;
  identifier: string;
  name: string;
  parentId?: number;
  type: string;
}
