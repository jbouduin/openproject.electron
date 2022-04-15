import { HalProperty } from '@jbouduin/hal-rest-client';
import { CustomFieldMap } from '../custom-field-map';
import { FormattableModel } from '../formattable.model';
import { EntityModel } from './entity.model';
import { ProjectEntityModel } from './project-entity.model';
import { WorkPackageTypeEntityModel } from './work-package-type-entity.model';

export class WorkPackageEntityModel extends EntityModel {

  //#region Standard workpackage properties -----------------------------------
  @HalProperty()
  lockVersion: number;

  @HalProperty()
  subject: string;

  @HalProperty({resourceType: FormattableModel})
  description: FormattableModel;

  @HalProperty()
  startDate: Date;

  @HalProperty()
  dueDate: Date;

  @HalProperty()
  derivedStartDate: Date;

  @HalProperty()
  derivedDueDate: Date;

  @HalProperty()
  scheduleManually: boolean;

  @HalProperty()
  parent: WorkPackageEntityModel;

  @HalProperty()
  project: ProjectEntityModel;

  @HalProperty()
  type: WorkPackageTypeEntityModel;
  //#endregion

  //#region Custom fields on Workpackage --------------------------------------
  @HalProperty({ name: CustomFieldMap.billable })
  billable: boolean;

  @HalProperty({ name: CustomFieldMap.nettoAmount})
  netAmount: number;
  //#endregion
}
