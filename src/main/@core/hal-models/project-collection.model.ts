import { HalProperty } from "hal-rest-client";
import { CollectionModel } from "./collection.model";
import { ProjectEntityModel } from "./project-entity.model";

export class ProjectCollectionModel extends CollectionModel<ProjectEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty(ProjectEntityModel)
  public elements: Array<ProjectEntityModel>;
  // </editor-fold>
}
