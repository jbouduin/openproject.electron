import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TimeEntryEntityModel, TimeEntryCollectionModel } from '@core/hal-models';
import { DtoTimeEntryList, DtoTimeEntry } from '@common';
import { ITimeEntryEntityAdapter } from '../entities/time-entry-entity.adapter';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from '../base-collection.adapter';
import { BaseList } from '../base-list';
import { ILogService } from '@core';
import SERVICETYPES from '@core/service.types';


// <editor-fold desc='Helper class'>
class TimeEntryList extends BaseList<DtoTimeEntry> implements DtoTimeEntryList { }
// </editor-fold>

export type ITimeEntryCollectionAdapter = IBaseCollectionAdapter<TimeEntryEntityModel, DtoTimeEntryList, DtoTimeEntry>;

@injectable()
export class TimeEntryCollectionAdapter
  extends BaseCollectionAdapter<TimeEntryEntityModel, DtoTimeEntryList, DtoTimeEntry>
  implements ITimeEntryCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoTimeEntryList {
    return new TimeEntryList();
  }
  // </editor-fold>

  // <editor-fold desc='ITimeEntryListAdapter interface methods'>
  public resourceToDto(entityAdapter: ITimeEntryEntityAdapter, collection: TimeEntryCollectionModel): Promise<DtoTimeEntryList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
