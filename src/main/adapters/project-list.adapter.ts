import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoProjectList, DtoProject } from '@ipc';

import { BaseList } from './classes/base-list';
import { IBaseListAdapter, BaseListAdapter } from './base-list.adapter';
import { IHalResourceHelper } from './hal-resource-helper';
import { IProjectAdapter } from './project.adapter';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class ProjectList extends BaseList<DtoProject> implements DtoProjectList { }
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
  public resourceToDto(baseAdapter: IProjectAdapter, halresource: HalResource): DtoProjectList {
    return super.resourceToDto(baseAdapter, halresource);
  }
  // </editor-fold>
}
