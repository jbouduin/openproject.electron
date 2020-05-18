import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoFormattableText, DtoTimeEntry } from '@ipc';

import { Base } from './classes/base';
import { IBaseAdapter, BaseAdapter } from './base.adapter';
import { IHalResourceHelper } from './hal-resource-helper';

import ADAPTERTYPES from './adapter.types';

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

export interface ITimeEntryAdapter extends IBaseAdapter<DtoTimeEntry> { }

@injectable()
export class TimeEntryAdapter extends BaseAdapter<DtoTimeEntry> implements ITimeEntryAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.HalResourceHelper) halResourceHelper: IHalResourceHelper) {
    super(halResourceHelper);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoTimeEntry {
    return new TimeEntry();
  }
  // </editor-fold>

  // <editor-fold desc='ICategoryAdapter interface methods'>
  public adapt(halResource: HalResource): DtoTimeEntry {
    const result = super.adapt(halResource);
    result.activityId = Number(this.halResourceHelper.getLinkHRef(halResource, 'activity').split('/').pop());
    result.activityTitle = this.halResourceHelper.getLinkStringProperty(halResource, 'activity', 'title');
    result.comment = this.halResourceHelper.getFormattableText(halResource, 'comment')
    result.customField2 = this.halResourceHelper.getStringProperty(halResource, 'customField2');
    result.customField3 = this.halResourceHelper.getStringProperty(halResource, 'customField3');
    result.hours = this.halResourceHelper.getStringProperty(halResource, 'hours');
    result.projectId = Number(this.halResourceHelper.getLinkHRef(halResource, 'project').split('/').pop());
    result.spentOn = this.halResourceHelper.getDateProperty(halResource, 'spentOn');
    result.userId = Number(this.halResourceHelper.getLinkHRef(halResource, 'user').split('/').pop());
    result.userTitle = this.halResourceHelper.getLinkStringProperty(halResource, 'user', 'title');
    result.workPackageId = Number(this.halResourceHelper.getLinkHRef(halResource, 'workPackage').split('/').pop());
    result.workPackageTitle = this.halResourceHelper.getLinkStringProperty(halResource, 'workPackage', 'title');
    return result;
  }
  // </editor-fold>
}
