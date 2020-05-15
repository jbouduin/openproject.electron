import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoProjectList, DtoProject } from '@ipc';

import { IBaseListAdapter, BaseListAdapter } from './base-list.adapter';
import { IHalResourceHelper } from './hal-resource-helper';
import { IProjectAdapter } from './project.adapter';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class ProjectList implements DtoProjectList {
  public total: number;
  public count: number;
  public pageSize?: number;
  public offset?: number;
  public items?: Array<DtoProject>;

  public constructor() {
    this.total = 0;
    this.count = 0;
    this.pageSize = undefined;
    this.offset = undefined;
    this.items = undefined;
  }
}
// </editor-fold>

export interface IProjectListAdapter extends IBaseListAdapter<DtoProjectList, DtoProject>{ }

@injectable()
export class ProjectListAdapter
  extends BaseListAdapter<DtoProjectList, DtoProject>
  implements IProjectListAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.HalResourceHelper) halResourceHelper: IHalResourceHelper) {
    super(halResourceHelper);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoProjectList {
    return new ProjectList();
  }
  // </editor-fold>

  // <editor-fold desc='IProjectListAdapter interface methods'>
  public adapt(baseAdapter: IProjectAdapter, halresource: HalResource): DtoProjectList {
    return super.adapt(baseAdapter, halresource);
  }
  // </editor-fold>
}
