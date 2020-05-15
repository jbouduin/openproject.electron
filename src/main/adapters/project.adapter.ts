import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoCategoryList, DtoProject } from '@ipc';

import { IBaseAdapter, BaseAdapter } from './base.adapter';
import { ICategoryAdapter } from './category.adapter';
import { ICategoryListAdapter } from './category-list.adapter';
import { IHalResourceHelper } from './hal-resource-helper';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class Project implements DtoProject {
  public id: number;
  public categories?: DtoCategoryList;
  public createdAt?: Date;
  public description: string;
  public identifier: string;
  public name: string;
  public updatedAt?: Date;
  public parentId?: number;
  public type: string;

  public constructor() {
    this.id = 0;
    this.categories = undefined;
    this.createdAt = undefined,
    this.description = '';
    this.identifier = '';
    this.name = '';
    this.updatedAt = undefined,
    this.parentId = undefined;
    this.type = '';
  }
}
// </editor-fold>

export interface IProjectAdapter extends IBaseAdapter<DtoProject> { }

@injectable()
export class ProjectAdapter extends BaseAdapter<DtoProject> implements IProjectAdapter {

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
  public adapt(halResource: HalResource): DtoProject {
    const result = super.adapt(halResource);
    result.identifier = this.halResourceHelper.getStringProperty(halResource, 'identifier');
    result.description = this.halResourceHelper.getStringProperty(halResource, 'description');
    result.name = this.halResourceHelper.getStringProperty(halResource, 'name');
    result.type = this.halResourceHelper.getStringProperty(halResource, 'type');
    const categories = halResource.links['categories'];
    if (categories) {
      result.categories = this.categoryListAdapter.adapt(this.categoryAdapter, categories);
    }
    return result;
  }
  // </editor-fold>
}
