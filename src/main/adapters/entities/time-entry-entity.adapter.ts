import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TimeEntryEntityModel } from '@core/hal-models';
import { DtoFormattableText, DtoTimeEntry, DtoTimeEntryActivity, DtoProject, DtoWorkPackage } from '@common';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';
import ADAPTERTYPES from '@adapters/adapter.types';
import { ITimeEntryActivityEntityAdapter } from './time-entry-activity-entity.adapter';
import { IProjectEntityAdapter } from './project-entity.adapter';
import { IWorkPackageEntityAdapter } from './work-package-entity.adapter';
import { ILogService } from '@core';
import SERVICETYPES from '@core/service.types';

// <editor-fold desc='Helper class'>

class TimeEntry extends Base implements DtoTimeEntry {
  public activity!: DtoTimeEntryActivity;
  public comment!: DtoFormattableText;
  public start!: string;
  public end!: string;
  public hours!: string;
  public project!: DtoProject;
  public spentOn!: Date;
  public userId!: number;
  public userName!: string;
  public workPackage!: DtoWorkPackage;
  public billed: boolean;

  public constructor() {
    super();
  }
}
// </editor-fold>

export type ITimeEntryEntityAdapter = IBaseEntityAdapter<TimeEntryEntityModel, DtoTimeEntry>;

@injectable()
export class TimeEntryEntityAdapter extends BaseEntityAdapter<TimeEntryEntityModel, DtoTimeEntry> implements ITimeEntryEntityAdapter {

  // <editor-fold desc='Private properties'>
  private activityAdapter: ITimeEntryActivityEntityAdapter;
  private projectAdapter: IProjectEntityAdapter;
  private workPackageAdapter: IWorkPackageEntityAdapter;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(ADAPTERTYPES.TimeEntryActivityEntityAdapter) activityAdapter: ITimeEntryActivityEntityAdapter,
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectAdapter: IProjectEntityAdapter,
    @inject(ADAPTERTYPES.WorkPackageEntityAdapter) workPackageAdapter: IWorkPackageEntityAdapter) {
    super(logService);
    this.activityAdapter = activityAdapter;
    this.projectAdapter = projectAdapter;
    this.workPackageAdapter = workPackageAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoTimeEntry {
    return new TimeEntry();
  }
  // </editor-fold>

  // <editor-fold desc='ITimeEntryAdapter interface methods'>
  public async resourceToDto(entityModel: TimeEntryEntityModel): Promise<DtoTimeEntry> {
    const result = await super.resourceToDto(entityModel);
    if (!entityModel.activity.isLoaded  && entityModel.activity.uri?.href) {
      await entityModel.activity.fetch();
    }
    result.activity = await this.activityAdapter.resourceToDto(entityModel.activity);
    result.comment = entityModel.comment;
    result.start = entityModel.start;
    result.end = entityModel.end;
    result.billed = entityModel.billed || false;
    result.hours = entityModel.hours;
    if (entityModel.project) {
      if (!entityModel.project.isLoaded && entityModel.project.uri?.href) {
        await entityModel.project.fetch();
      }
      if (entityModel.project.isLoaded) {
        result.project = await this.projectAdapter.resourceToDto(entityModel.project);
      }
    }
    result.spentOn = typeof entityModel.spentOn === 'string' ? new Date(entityModel.spentOn) : entityModel.spentOn;

    // if we are converting the payload of the form, there is no user !
    // As user is non writeable, there is no need for a DtoUser yet
    // TODO #1239 there is something strange with user, although the data is available, it appears unloaded
    if (entityModel.user) {
      // if (!entityModel.user.isLoaded) {
      //   await entityModel.user.fetch();
      // }
      result.userId = entityModel.user.id;
      result.userName = entityModel.user.name;
    }

    if (entityModel.workPackage) {
      if (!entityModel.workPackage.isLoaded  && entityModel.workPackage.uri?.href) {
        await entityModel.workPackage.fetch();
      }
      if (entityModel.workPackage.isLoaded) {
        result.workPackage = await this.workPackageAdapter.resourceToDto(entityModel.workPackage);
      }
    }
    return result;
  }
  // </editor-fold>
}
