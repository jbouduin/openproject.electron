import { HalProperty, HalResource } from '@jbouduin/hal-rest-client';
import { EntityModel } from './entity.model';
import { FormattableModel } from '../formattable.model';
import { CustomFieldMap } from '../custom-field-map';
import { WorkPackageTypeCollectionModel } from '../collections/work-package-type-collection.model';
import { CategoryCollectionModel} from '../collections/category-collection.model';

export class ProjectEntityModel extends EntityModel {

  //#region standard project properties ---------------------------------------
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
  public types: WorkPackageTypeCollectionModel;

  @HalProperty()
  public categories: CategoryCollectionModel;

  //#endregion

  //#region custom fields -----------------------------------------------------
  @HalProperty({ name: CustomFieldMap.timesheetApprovalName })
  public timesheetApprovalName: string;

  @HalProperty({ name: CustomFieldMap.timesheetApprovalLocation })
  public timesheetApprovalLocation: string;

  @HalProperty({ name: CustomFieldMap.pricing })
  public pricing: HalResource;

  @HalProperty({ name: CustomFieldMap.startDate })
  public startDate: Date;

  @HalProperty({ name: CustomFieldMap.endDate })
  public endDate: Date;

  @HalProperty({ name: CustomFieldMap.customer })
  public customer: string;

  @HalProperty({ name: CustomFieldMap.endCustomer })
  public endCustomer: string;
  //#endregion
}
