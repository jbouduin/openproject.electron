import { HalProperty } from "hal-rest-client";
import { CollectionModel } from "./collection.model";
import { WorkPackageStatusEntityModel } from "../entities/work-package-status-entity.model";

export class WorkPackageStatusCollectionModel extends CollectionModel<WorkPackageStatusEntityModel> {
  //#region Public abstract properties implementation
  @HalProperty(WorkPackageStatusEntityModel)
  public elements: Array<WorkPackageStatusEntityModel>;
  //#endregion
}
