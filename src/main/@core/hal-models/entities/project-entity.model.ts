import { HalProperty } from "hal-rest-client";
import { EntityModel } from "./entity.model";
import { FormattableModel } from "../formattable.model";

export class ProjectEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public active: boolean;

  @HalProperty()
  public description: FormattableModel;

  @HalProperty()
  public identifier: string;

  @HalProperty()
  public name: string;

  @HalProperty()
  public public: boolean;

  @HalProperty()
  public parent: ProjectEntityModel;

  @HalProperty()
  public customField7: string;

  @HalProperty()
  public customField8: string;
  // </editor-fold>
}
