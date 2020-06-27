import { HalProperty } from "hal-rest-client";
import { EntityModel } from "./entity.model";
import { ProjectEntityModel } from "./project-entity.model";

export class TimeEntryActivityEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public name: string;

  @HalProperty()
  public position: number;

  @HalProperty()
  public default: boolean;

  @HalProperty(ProjectEntityModel)
  public projects: Array<ProjectEntityModel>;
  // </editor-fold>
}
