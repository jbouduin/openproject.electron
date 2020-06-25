import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoFormattableText, DtoCategoryList, DtoProject } from '@ipc';

import { Base } from './classes/base';
import { ICategoryAdapter } from './category.adapter';
import { ICategoryListAdapter } from './category-list.adapter';
import { IHalResourceHelper } from './hal-resource-helper';

import ADAPTERTYPES from './adapter.types';
import { IBaseEntityAdapter, BaseEntityAdapter } from './base-entity.adapter';
import { ProjectEntityModel } from '@core/hal-models/project-entity.model';

// <editor-fold desc='Helper class'>
class Project extends Base implements DtoProject {
  public categories!: DtoCategoryList;
  public description!: DtoFormattableText;
  public identifier!: string;
  public name!: string;
  public parentId!: number;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface IProjectEntityAdapter extends IBaseEntityAdapter<ProjectEntityModel, DtoProject> { }

@injectable()
export class ProjectEntityAdapter extends BaseEntityAdapter<ProjectEntityModel, DtoProject> implements IProjectEntityAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.HalResourceHelper) halResourceHelper: IHalResourceHelper,
    @inject(ADAPTERTYPES.CategoryListAdapter) private categoryListAdapter: ICategoryListAdapter,
    @inject(ADAPTERTYPES.CategoryAdapter) private categoryAdapter: ICategoryAdapter) {
    super(halResourceHelper);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoProject {
    return new Project();
  }
  // </editor-fold>

  // <editor-fold desc='IProjectAdapter interface methods'>
  public resourceToDto(entityModel: ProjectEntityModel): DtoProject {
    const result = super.resourceToDto(entityModel);
    result.identifier = entityModel.identifier;
    result.description = this.resourceToFormattable(entityModel.description);
    result.name = entityModel.name;
    const parentRef = entityModel.links['parent'].prop('href');
    if (parentRef) {
      result.parentId = Number(entityModel.links['parent'].prop('href').split('/').pop());
    }
    // TODO const categories = halResource.links['categories'];
    // if (categories) {
    //   result.categories = this.categoryListAdapter.resourceToDto(this.categoryAdapter, categories);
    // }
    return result;
  }
  // </editor-fold>
}
