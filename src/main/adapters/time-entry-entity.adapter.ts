import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoFormattableText, DtoTimeEntry } from '@ipc';
import { Base } from './classes/base';
import { IBaseEntityAdapter, BaseEntityAdapter } from './base-entity.adapter';

import { TimeEntryEntityModel } from '@core/hal-models';

// <editor-fold desc='Helper class'>
class TimeEntry extends Base implements DtoTimeEntry {
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

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
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
    if (!entityModel.user.isLoaded) {
      await entityModel.user.fetch();
    }
    result.userId = entityModel.user.id;
    result.userTitle = entityModel.user.name;

    if (!entityModel.workPackage.isLoaded) {
      await entityModel.workPackage.fetch();
    }
    result.workPackageId = entityModel.workPackage.id;
    result.workPackageTitle = entityModel.workPackage.subject;
    return result;
  }
  // </editor-fold>
}
