import { HalProperty } from "hal-rest-client";
import { CollectionModel } from "./collection.model";
import { WorkPackageTypeEntityModel } from "../entities/work-package-type-entity.model";

export class WorkPackageTypeCollectionModel extends CollectionModel<WorkPackageTypeEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty(WorkPackageTypeEntityModel)
  public elements: Array<WorkPackageTypeEntityModel>;
  // </editor-fold>
}
