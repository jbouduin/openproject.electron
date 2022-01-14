import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { WorkPackageEntityModel } from '@core/hal-models';
import { DtoWorkPackage, DtoFormattableText, DtoProject, DtoWorkPackageType } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { IProjectEntityAdapter } from './project-entity.adapter';
import { Base } from '../base';

import ADAPTERTYPES from '@adapters/adapter.types';
import { IWorkPackageTypeEntityAdapter } from './work-package-type-entity.adapter';

// <editor-fold desc='Helper class'>
class WorkPackage extends Base implements DtoWorkPackage {
  public lockVersion: number;
  public subject: string;
  public description: DtoFormattableText;
  public startDate: Date;
  public dueDate: Date;
  public parent: WorkPackage;
  public project: DtoProject;
  public type: DtoWorkPackageType;
  public billable?: boolean;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface IWorkPackageEntityAdapter extends IBaseEntityAdapter<WorkPackageEntityModel, DtoWorkPackage> { }

@injectable()
export class WorkPackageEntityAdapter
  extends BaseEntityAdapter<WorkPackageEntityModel, DtoWorkPackage>
  implements IWorkPackageEntityAdapter {

  // <editor-fold desc='Private properties'>
  private projectEntityAdapter: IProjectEntityAdapter;
  private workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectEntityAdapter: IProjectEntityAdapter,
    @inject(ADAPTERTYPES.WorkPackageTypeEntityAdapter) workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter) {
    super();
    this.projectEntityAdapter = projectEntityAdapter;
    this.workPackageTypeEntityAdapter = workPackageTypeEntityAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoWorkPackage {
    return new WorkPackage();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageEntityAdapter interface methods'>
  public async resourceToDto(entityModel: WorkPackageEntityModel): Promise<DtoWorkPackage> {
    const result = await super.resourceToDto(entityModel);
    result.lockVersion = entityModel.lockVersion;
    result.subject = entityModel.subject;
    result.description = this.resourceToFormattable(entityModel.description);
    result.startDate = entityModel.startDate;
    result.dueDate = entityModel.dueDate;
    result.billable = entityModel.billable;

    if (entityModel.parent && entityModel.parent.uri?.uri) {
      // if not prefetched we do not load, it is apparently not needed then
      // if (!entityModel.parent.isLoaded) {
      //   console.log('parent apparently not prefetched');
      //   await entityModel.parent.fetch();
      // }
      if (entityModel.parent.isLoaded) {
        result.parent = await this.resourceToDto(entityModel.parent);
      }
    }
    if (entityModel.project) {
      if (!entityModel.project.isLoaded) {
        console.log('project apparently not prefetched');
        await entityModel.project.fetch();
      }
      if (entityModel.project.isLoaded) {
        result.project = await this.projectEntityAdapter.resourceToDto(entityModel.project);
      }
    }
    if (entityModel.type) {
      if (!entityModel.type.isLoaded) {
        console.log('type apparently not prefetched');
        await entityModel.type.fetch();
      }
      if (entityModel.type.isLoaded) {
        result.type = await this.workPackageTypeEntityAdapter.resourceToDto(entityModel.type);
      }
    }
    return result;
  }
  // </editor-fold>
}
