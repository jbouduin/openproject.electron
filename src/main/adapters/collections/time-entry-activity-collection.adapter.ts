import { injectable } from 'inversify';
import 'reflect-metadata';
import { TimeEntryActivityEntityModel, TimeEntryActivityCollectionModel } from '@core/hal-models';
import { DtoTimeEntryActivityList, DtoTimeEntryActivity } from '@ipc';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from '../base-collection.adapter';
import { ITimeEntryActivityEntityAdapter } from '../entities/time-entry-activity-entity.adapter';
import { BaseList } from '../base-list';

// <editor-fold desc='Helper class'>
class TimeEntryActivityList extends BaseList<DtoTimeEntryActivity> implements DtoTimeEntryActivityList { }
// </editor-fold>

export interface ITimeEntryActivityCollectionAdapter
  extends IBaseCollectionAdapter<TimeEntryActivityEntityModel, DtoTimeEntryActivityList, DtoTimeEntryActivity>{ }

@injectable()
export class TimeEntryActivityCollectionAdapter
  extends BaseCollectionAdapter<TimeEntryActivityEntityModel, DtoTimeEntryActivityList, DtoTimeEntryActivity>
  implements ITimeEntryActivityCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoTimeEntryActivityList {
    return new TimeEntryActivityList();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageListAdapter interface methods'>
  public resourceToDto(entityAdapter: ITimeEntryActivityEntityAdapter, collection: TimeEntryActivityCollectionModel): Promise<DtoTimeEntryActivityList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
