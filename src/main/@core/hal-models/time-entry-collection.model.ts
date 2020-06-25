import { HalProperty } from "hal-rest-client";
import { CollectionModel } from "./collection.model";
import { TimeEntryEntityModel } from "./time-entry-entity.model";

export class TimeEntryCollectionModel extends CollectionModel<TimeEntryEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty(TimeEntryEntityModel)
  public elements: Array<TimeEntryEntityModel>;
  // </editor-fold>
}
