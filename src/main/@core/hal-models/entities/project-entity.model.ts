import { HalProperty, HalResource } from "hal-rest-client";
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

  @HalProperty('customField7')
  public timesheetApprovalName: string;

  @HalProperty('customField8')
  public timesheetApprovalLocation: string;

  @HalProperty('customField9')
  public pricing: HalResource;
  // </editor-fold>
}
