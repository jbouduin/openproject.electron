import { HalProperty } from "hal-rest-client";
import { EntityModel } from "./entity.model";

export class WorkPackageTypeEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  name: string;

  @HalProperty()
  color: string;

  @HalProperty()
  position: number;

  @HalProperty()
  isDefault: boolean;

  @HalProperty()
  isMilestone: boolean;
  // </editor-fold>
}
