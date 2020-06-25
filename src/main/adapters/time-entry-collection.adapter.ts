import { injectable } from 'inversify';
import 'reflect-metadata';
import { DtoTimeEntryList, DtoTimeEntry } from '@ipc';
import { BaseList } from './classes/base-list';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from './base-collection.adapter';
import { TimeEntryEntityModel, TimeEntryCollectionModel } from '@core/hal-models';
import { ITimeEntryEntityAdapter } from './time-entry-entity.adapter';


// <editor-fold desc='Helper class'>
class TimeEntryList extends BaseList<DtoTimeEntry> implements DtoTimeEntryList { }
// </editor-fold>

export interface ITimeEntryCollectionAdapter extends IBaseCollectionAdapter<TimeEntryEntityModel, DtoTimeEntryList, DtoTimeEntry>{ }

@injectable()
export class TimeEntryCollectionAdapter
  extends BaseCollectionAdapter<TimeEntryEntityModel, DtoTimeEntryList, DtoTimeEntry>
  implements ITimeEntryCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
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
