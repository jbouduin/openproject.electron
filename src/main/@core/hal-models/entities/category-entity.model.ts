import { HalProperty } from "hal-rest-client";
import { EntityModel } from "./entity.model";

export class CategoryEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public name: string;
  // </editor-fold>
}
