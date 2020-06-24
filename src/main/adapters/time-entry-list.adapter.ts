import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoTimeEntryList, DtoTimeEntry } from '@ipc';

import { BaseList } from './classes/base-list';
import { IBaseListAdapter, BaseListAdapter } from './base-list.adapter';
import { IHalResourceHelper } from './hal-resource-helper';
import { ITimeEntryAdapter } from './time-entry.adapter';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class TimeEntryList extends BaseList<DtoTimeEntry> implements DtoTimeEntryList { }
// </editor-fold>

export interface ITimeEntryListAdapter extends IBaseListAdapter<DtoTimeEntryList, DtoTimeEntry>{ }

@injectable()
export class TimeEntryListAdapter
  extends BaseListAdapter<DtoTimeEntryList, DtoTimeEntry>
  implements ITimeEntryListAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.HalResourceHelper) halResourceHelper: IHalResourceHelper) {
    super(halResourceHelper);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoTimeEntryList {
    return new TimeEntryList();
  }
  // </editor-fold>

  // <editor-fold desc='ICategoryAdapter interface methods'>
  public resourceToDto(baseAdapter: ITimeEntryAdapter, halresource: HalResource): DtoTimeEntryList {
    return super.resourceToDto(baseAdapter, halresource);
  }
  // </editor-fold>
}
