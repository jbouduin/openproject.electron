import { HalProperty } from '@jbouduin/hal-rest-client';
import { TimeEntryEntityModel } from '../entities/time-entry-entity.model';
import { CollectionModel } from './collection.model';

export class TimeEntryCollectionModel extends CollectionModel<TimeEntryEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty({ resourceType: TimeEntryEntityModel })
  public elements: Array<TimeEntryEntityModel>;
  // </editor-fold>
}
