import { injectable } from 'inversify';
import 'reflect-metadata';
import { DtoCategory } from '@ipc';
import { Base } from './classes/base';
import { IBaseEntityAdapter, BaseEntityAdapter } from './base-entity.adapter';
import { CategoryEntityModel } from '@core/hal-models';

// <editor-fold desc='Helper class'>
class Category extends Base implements DtoCategory {
  public name!: string;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface ICategoryEntityAdapter extends IBaseEntityAdapter<CategoryEntityModel, DtoCategory> { }

@injectable()
export class CategoryEntityAdapter extends BaseEntityAdapter<CategoryEntityModel, DtoCategory> implements ICategoryEntityAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoCategory {
    return new Category();
  }
  // </editor-fold>

  // <editor-fold desc='ICategoryAdapter interface methods'>
  public async resourceToDto(entityModel: CategoryEntityModel): Promise<DtoCategory> {
    const result = await super.resourceToDto(entityModel);
    result.name = entityModel.name;
    return result;
  }
  // </editor-fold>
}
