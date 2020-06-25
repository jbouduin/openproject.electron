import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoFormattableText, DtoCategoryList, DtoProject } from '@ipc';

import { Base } from './classes/base';
import { ICategoryAdapter } from './category.adapter';
import { ICategoryListAdapter } from './category-list.adapter';

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
    @inject(ADAPTERTYPES.CategoryListAdapter) private categoryListAdapter: ICategoryListAdapter,
    @inject(ADAPTERTYPES.CategoryAdapter) private categoryAdapter: ICategoryAdapter) {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoProject {
    return new Project();
  }
  // </editor-fold>

  // <editor-fold desc='IProjectAdapter interface methods'>
  public async resourceToDto(entityModel: ProjectEntityModel): Promise<DtoProject> {
    const result = await super.resourceToDto(entityModel);
    result.identifier = entityModel.identifier;
    result.description = this.resourceToFormattable(entityModel.description);
    result.name = entityModel.name;
    // TODO in project-collection-adapter: sort the projects
    const parentRef = entityModel.links['parent'].prop('href');
    if (parentRef) {
      result.parentId = Number(entityModel.links['parent'].prop('href').split('/').pop());
    }
    return result;
  }
  // </editor-fold>
}
