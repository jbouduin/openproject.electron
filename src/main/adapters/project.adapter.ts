import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoFormattableText, DtoCategoryList, DtoProject } from '@ipc';

import { Base } from './classes/base';
import { IBaseAdapter, BaseAdapter } from './base.adapter';
import { ICategoryAdapter } from './category.adapter';
import { ICategoryListAdapter } from './category-list.adapter';
import { IHalResourceHelper } from './hal-resource-helper';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class Project extends Base implements DtoProject {
  public categories!: DtoCategoryList;
  public description!: DtoFormattableText;
  public identifier!: string;
  public name!: string;
  public parentId!: number;
  public type!: string;

  public constructor() {
    super();
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
  public resourceToDto(halResource: HalResource): DtoProject {
    const result = super.resourceToDto(halResource);
    result.identifier = this.halResourceHelper.getStringProperty(halResource, 'identifier');
    result.description = this.halResourceHelper.getFormattableText(halResource, 'description');
    result.name = this.halResourceHelper.getStringProperty(halResource, 'name');
    result.type = this.halResourceHelper.getStringProperty(halResource, 'type');
    const parentRef = this.halResourceHelper.getLinkHRef(halResource, 'parent');
    if (parentRef) {
      result.parentId = Number(this.halResourceHelper.getLinkHRef(halResource, 'parent', '0').split('/').pop());
    }
    const categories = halResource.links['categories'];
    if (categories) {
      result.categories = this.categoryListAdapter.resourceToDto(this.categoryAdapter, categories);
    }
    return result;
  }
  // </editor-fold>
}
