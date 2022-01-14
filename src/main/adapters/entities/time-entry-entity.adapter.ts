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
    if (!entityModel.activity.isLoaded  && entityModel.activity.uri?.uri) {
      console.log('activity apparently not prefetched');
      await entityModel.activity.fetch();
    }
    result.activity = await this.activityAdapter.resourceToDto(entityModel.activity);
    result.comment = this.resourceToFormattable(entityModel.comment);
    result.start = entityModel.start;
    result.end = entityModel.end;
    result.billed = entityModel.billed || false;
    result.hours = entityModel.hours;
    if (entityModel.project) {
      if (!entityModel.project.isLoaded && entityModel.project.uri?.uri) {
        console.log('project apparently not prefetched');
        await entityModel.project.fetch();
      }
      if (entityModel.project.isLoaded) {
        result.project = await this.projectAdapter.resourceToDto(entityModel.project);
      }
    }
    result.spentOn = entityModel.spentOn;

    // if we are converting the payload of the form, there is no user !
    // As user is non writeable, there is no need for a DtoUser yet
    // #1239 there is something strange with user, although the data is available, it appears unloaded
    if (entityModel.user) {
      if (!entityModel.user.isLoaded) {
        // console.log('user apparently not prefetched');
        // await entityModel.user.fetch();
      }
      result.userId = entityModel.user.id;
      result.userName = entityModel.user.name;
    }

    if (entityModel.workPackage) {
      if (!entityModel.workPackage.isLoaded  && entityModel.workPackage.uri?.uri) {
        console.log('workpackage apparently not prefetched');
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
