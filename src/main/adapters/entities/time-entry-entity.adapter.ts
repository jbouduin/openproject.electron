import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TimeEntryEntityModel } from '@core/hal-models';
import { DtoFormattableText, DtoTimeEntry, DtoTimeEntryActivity } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';
import ADAPTERTYPES from '@adapters/adapter.types';
import { ITimeEntryActivityEntityAdapter } from './time-entry-activity-entity.adapter';

// <editor-fold desc='Helper class'>

class TimeEntry extends Base implements DtoTimeEntry {
  public activity: DtoTimeEntryActivity;
  public activityId!: number;
  public activityTitle!: string;
  public comment!: DtoFormattableText;
  public customField2!: string;
  public customField3!: string;
  public hours!: string;
  public projectId!: number;
  public spentOn!: Date;
  public userId!: number;
  public userTitle!: string;
  public workPackageId!: number;
  public workPackageTitle!: string;

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
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(@inject(ADAPTERTYPES.TimeEntryActivityEntityAdapter) activityAdapter: ITimeEntryActivityEntityAdapter) {
    super();
    this.activityAdapter = activityAdapter;
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
    result.activityId = entityModel.activity.id;
    result.activityTitle = entityModel.activity.name;

    result.comment = this.resourceToFormattable(entityModel.comment);
    result.customField2 = entityModel.customField2;
    result.customField3 = entityModel.customField3;
    result.hours = entityModel.hours;
    if (!entityModel.project.isLoaded) {
      await entityModel.project.fetch();
    }
    result.projectId = entityModel.project.id;
    result.spentOn = entityModel.spentOn;
    // if we are converting the payload of the form, there is no user !
    // As user is non writeable, there is no need for a DtoUser yet
    if (entityModel.user) {
      if (!entityModel.user.isLoaded) {
        await entityModel.user.fetch();
      }
      result.userId = entityModel.user.id;
      result.userTitle = entityModel.user.name;
    }

    if (!entityModel.workPackage.isLoaded) {
      await entityModel.workPackage.fetch();
    }
    result.workPackageId = entityModel.workPackage.id;
    result.workPackageTitle = entityModel.workPackage.subject;
    return result;
  }
  // </editor-fold>
}
