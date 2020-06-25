import { injectable } from 'inversify';
import 'reflect-metadata';
import { CategoryEntityModel, CategoryCollectionModel } from '@core/hal-models';
import { DtoCategoryList, DtoCategory } from '@ipc';
import { ICategoryEntityAdapter } from '../entities/category-entity.adapter';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from '../base-collection.adapter';
import { BaseList } from '../base-list';

// <editor-fold desc='Helper class'>
class CategoryList extends BaseList<DtoCategory> implements DtoCategoryList { }
// </editor-fold>

export interface ICategoryCollectionAdapter extends IBaseCollectionAdapter<CategoryEntityModel, DtoCategoryList, DtoCategory>{ }

@injectable()
export class CategoryCollectionAdapter
  extends BaseCollectionAdapter<CategoryEntityModel, DtoCategoryList, DtoCategory>
  implements ICategoryCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoCategoryList {
    return new CategoryList();
  }
  // </editor-fold>

  // <editor-fold desc='ICategoryListAdapter interface methods'>
  public resourceToDto(entityAdapter: ICategoryEntityAdapter, collection: CategoryCollectionModel): Promise<DtoCategoryList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
