import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoTimeEntry } from '@ipc';

import { IBaseAdapter, BaseAdapter } from './base.adapter';
import { IHalResourceHelper } from './hal-resource-helper';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class TimeEntry implements DtoTimeEntry {
  public id: number;
  public comment: string;
  public createdAt?: Date;
  public hours: string;
  public spentOn: Date;
  public updatedAt?: Date;

  public constructor() {
    this.id = 0;
    this.comment = '';
    this.createdAt = undefined,
    this.hours = '';
    this.spentOn = new Date();
    this.updatedAt = undefined
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
    result.spentOn = this.halResourceHelper.getDateProperty(halResource, 'spentOn');
    // result.customField2 = this.halResourceHelper.getStringProperty(halModel, 'customField2');
    // result.customField3 = this.halResourceHelper.getStringProperty(halModel, 'customField3');
    result.hours = this.halResourceHelper.getStringProperty(halResource, 'hours');
    result.comment = this.halResourceHelper.getStringProperty(halResource, 'comment');
    // QAD Solution to have the workpackage id
    // result.workPackageId = Number(this.halResourceHelper.getLinkHRef(halModel, 'workPackage').split('/').pop());

    return result;
  }
  // </editor-fold>
}
