import { HalProperty } from "hal-rest-client";
import { ProjectEntityModel } from "../entities/project-entity.model";
import { CollectionModel } from "./collection.model";

export class ProjectCollectionModel extends CollectionModel<ProjectEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty(ProjectEntityModel)
  public elements: Array<ProjectEntityModel>;
  // </editor-fold>
}
