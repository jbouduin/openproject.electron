import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { WorkPackageEntityModel } from '@core/hal-models';
import { DtoWorkPackage, DtoFormattableText, DtoProject, DtoWorkPackageType } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { IProjectEntityAdapter } from './project-entity.adapter';
import { Base } from '../base';

import ADAPTERTYPES from '@adapters/adapter.types';
import { IWorkPackageTypeEntityAdapter } from './work-package-type-entity.adapter';
import { ILogService } from '@core';
import SERVICETYPES from '@core/service.types';

//#region Helper class
class WorkPackage extends Base implements DtoWorkPackage {
  public lockVersion: number;
  public subject: string;
  public description: DtoFormattableText;
  public startDate: Date;
  public dueDate: Date;
  public derivedStartDate: Date;
  public derivedDueDate: Date;
  public scheduleManually: boolean;
  public parent: WorkPackage;
  public project: DtoProject;
  public type: DtoWorkPackageType;
  public billable?: boolean;
  public netAmount?: number;

  public constructor() {
    super();
  }
}
//#endregion

export type IWorkPackageEntityAdapter = IBaseEntityAdapter<WorkPackageEntityModel, DtoWorkPackage>;

@injectable()
export class WorkPackageEntityAdapter
  extends BaseEntityAdapter<WorkPackageEntityModel, DtoWorkPackage>
  implements IWorkPackageEntityAdapter {

  //#regionPrivate properties
  private projectEntityAdapter: IProjectEntityAdapter;
  private workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter;
  //#endregion

  //#regionConstructor & C°
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectEntityAdapter: IProjectEntityAdapter,
    @inject(ADAPTERTYPES.WorkPackageTypeEntityAdapter) workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter) {
    super(logService);
    this.projectEntityAdapter = projectEntityAdapter;
    this.workPackageTypeEntityAdapter = workPackageTypeEntityAdapter;
  }
  //#endregion

  //#regionAbstract methods implementation
  public createDto(): DtoWorkPackage {
    return new WorkPackage();
  }
  //#endregion

  //#regionIWorkPackageEntityAdapter interface methods
  public async resourceToDto(entityModel: WorkPackageEntityModel): Promise<DtoWorkPackage> {
    const result = await super.resourceToDto(entityModel);
    result.lockVersion = entityModel.lockVersion;
    result.subject = entityModel.subject;
    result.description = this.resourceToFormattable(entityModel.description);
    result.startDate = entityModel.startDate;
    result.dueDate = entityModel.dueDate;
    result.derivedStartDate = entityModel.derivedStartDate;
    result.derivedDueDate = entityModel.derivedDueDate;
    result.scheduleManually = entityModel.scheduleManually;
    result.billable = entityModel.billable;
    result.netAmount = entityModel.netAmount;

    if (entityModel.parent && entityModel.parent.uri?.href) {
      // if not prefetched we do not load, it is apparently not needed then
      // if (!entityModel.parent.isLoaded) {
      //   await entityModel.parent.fetch();
      // }
      if (entityModel.parent.isLoaded) {
        result.parent = await this.resourceToDto(entityModel.parent);
      }
    }
    if (entityModel.project) {
      if (!entityModel.project.isLoaded) {
        await entityModel.project.fetch();
      }
      if (entityModel.project.isLoaded) {
        result.project = await this.projectEntityAdapter.resourceToDto(entityModel.project);
      }
    }
    if (entityModel.type) {
      if (!entityModel.type.isLoaded) {
        await entityModel.type.fetch();
      }
      if (entityModel.type.isLoaded) {
        result.type = await this.workPackageTypeEntityAdapter.resourceToDto(entityModel.type);
      }
    }
    return result;
  }
  //#endregion
}
