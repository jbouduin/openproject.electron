import { HalProperty } from '@jbouduin/hal-rest-client';
import { CategoryEntityModel } from '../entities/category-entity.model';
import { CollectionModel } from './collection.model';

export class CategoryCollectionModel extends CollectionModel<CategoryEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty({ resourceType: CategoryEntityModel })
  public elements: Array<CategoryEntityModel>;
  // </editor-fold>
}
