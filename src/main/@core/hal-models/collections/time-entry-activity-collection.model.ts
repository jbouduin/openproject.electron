import { HalProperty } from '@jbouduin/hal-rest-client';
import { TimeEntryActivityEntityModel } from '../entities/time-entry-activity-entity.model';
import { CollectionModel } from './collection.model';

export class TimeEntryActivityCollectionModel extends CollectionModel<TimeEntryActivityEntityModel> {
  //#region abstract properties implementation
  @HalProperty({ resourceType: TimeEntryActivityEntityModel })
  public elements: Array<TimeEntryActivityEntityModel>;
  //#endregion
}
