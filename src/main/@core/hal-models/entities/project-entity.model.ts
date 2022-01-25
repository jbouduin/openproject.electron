import { HalProperty, HalResource } from '@jbouduin/hal-rest-client';
import { EntityModel } from './entity.model';
import { FormattableModel } from '../formattable.model';

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
  @HalProperty({ name: 'customField7'})
  public timesheetApprovalName: string;

  @HalProperty({ name: 'customField8'})
  public timesheetApprovalLocation: string;

  @HalProperty({ name: 'customField9'})
  public pricing: HalResource;

  @HalProperty({ name: 'customField10'})
  public startDate: Date;

  @HalProperty({ name: 'customField11'})
  public endDate: Date;

  @HalProperty({ name: 'customField12'})
  public customer: string;

  @HalProperty({ name: 'customField13'})
  public endCustomer: string;
  //#endregion
}
