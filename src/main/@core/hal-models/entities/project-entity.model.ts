import { HalProperty, HalResource } from "hal-rest-client";
import { EntityModel } from "./entity.model";
import { FormattableModel } from "../formattable.model";

export class ProjectEntityModel extends EntityModel {

  //#region standard project properties
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
  //#endregion

  //#region custom fields -----------------------------------------------------
  @HalProperty('customField7')
  public timesheetApprovalName: string;

  @HalProperty('customField8')
  public timesheetApprovalLocation: string;

  @HalProperty('customField9')
  public pricing: HalResource;

  @HalProperty('customField10')
  public startDate: Date;

  @HalProperty('customField11')
  public endDate: Date;

  @HalProperty('customField12')
  public customer: string;

  @HalProperty('customField13')
  public endCustomer: string;
  //#endregion
}
