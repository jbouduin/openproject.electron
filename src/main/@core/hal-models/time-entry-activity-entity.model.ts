import { HalProperty } from "hal-rest-client";
import { EntityModel } from "./entity.model";

export class TimeEntryActivityEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public name: string;

  @HalProperty()
  public position: number;

  @HalProperty()
  public default: boolean;
  // </editor-fold>
}
