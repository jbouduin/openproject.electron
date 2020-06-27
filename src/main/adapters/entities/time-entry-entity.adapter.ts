import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TimeEntryEntityModel } from '@core/hal-models';
import { DtoFormattableText, DtoTimeEntry, DtoTimeEntryActivity, DtoProject, DtoWorkPackage } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';
import ADAPTERTYPES from '@adapters/adapter.types';
import { ITimeEntryActivityEntityAdapter } from './time-entry-activity-entity.adapter';
import { IProjectEntityAdapter } from './project-entity.adapter';
import { IWorkPackageEntityAdapter } from './work-package-entity.adapter';

// <editor-fold desc='Helper class'>

class TimeEntry extends Base implements DtoTimeEntry {
  public activity!: DtoTimeEntryActivity;
  public comment!: DtoFormattableText;
  public customField2!: string;
  public customField3!: string;
  public hours!: string;
  public project!: DtoProject;
  public spentOn!: Date;
  public userId!: number;
  public userName!: string;
  public workPackage!: DtoWorkPackage;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface ITimeEntryEntityAdapter extends IBaseEntityAdapter<TimeEntryEntityModel, DtoTimeEntry> { }

@injectable()
export class TimeEntryEntityAdapter extends BaseEntityAdapter<TimeEntryEntityModel, DtoTimeEntry> implements ITimeEntryEntityAdapter {

  // <editor-fold desc='Private properties'>
  private activityAdapter: ITimeEntryActivityEntityAdapter;
  private projectAdapter: IProjectEntityAdapter;
  private workPackageAdapter: IWorkPackageEntityAdapter;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.TimeEntryActivityEntityAdapter) activityAdapter: ITimeEntryActivityEntityAdapter,
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectAdapter: IProjectEntityAdapter,
    @inject(ADAPTERTYPES.WorkPackageEntityAdapter) workPackageAdapter: IWorkPackageEntityAdapter) {
    super();
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
    if (!entityModel.activity.isLoaded) {
      await entityModel.activity.fetch();
    }
    result.activity = await this.activityAdapter.resourceToDto(entityModel.activity);
    result.comment = this.resourceToFormattable(entityModel.comment);
    result.customField2 = entityModel.customField2;
    result.customField3 = entityModel.customField3;
    result.hours = entityModel.hours;
    if (entityModel.project) {
      if (!entityModel.project.isLoaded) {
        await entityModel.project.fetch();
      }
      result.project = await this.projectAdapter.resourceToDto(entityModel.project);
    }
    result.spentOn = entityModel.spentOn;

    // if we are converting the payload of the form, there is no user !
    // As user is non writeable, there is no need for a DtoUser yet
    if (entityModel.user) {
      if (!entityModel.user.isLoaded) {
        await entityModel.user.fetch();
      }
      result.userId = entityModel.user.id;
      result.userName = entityModel.user.name;
    }

    if (entityModel.workPackage) {
      if (!entityModel.workPackage.isLoaded) {
        await entityModel.workPackage.fetch();
      }
      result.workPackage = await this.workPackageAdapter.resourceToDto(entityModel.workPackage);
    }
    return result;
  }
  // </editor-fold>
}
