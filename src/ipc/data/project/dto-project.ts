import { DtoCategory } from './dto-category';

export interface DtoProject {
  categories: Array<DtoCategory>;
  id: number;
  name: string;
  parentId?: number;
}
