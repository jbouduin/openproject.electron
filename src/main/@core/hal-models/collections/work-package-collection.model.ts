import { HalProperty } from "hal-rest-client";
import { CollectionModel } from "./collection.model";
import { WorkPackageEntityModel } from "../entities/work-package-entity.model";

export class WorkPackageCollectionModel extends CollectionModel<WorkPackageEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty(WorkPackageEntityModel)
  public elements: Array<WorkPackageEntityModel>;
  // </editor-fold>
}
