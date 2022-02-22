import { Pricing } from '../../types';
import { DtoWorkPackageTypeList } from '../work-package/dto-work-package-type';
import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoCategoryList } from './dto-category';

export type DtoProjectList = DtoBaseList<DtoProject>;

export interface DtoProject extends DtoBase {
  //#region standard project properties from HalResource ----------------------
  active: boolean
  description: DtoFormattableText;
  identifier: string;
  name: string;
  //#endregion

  //#region custom fields -----------------------------------------------------
  timesheetApprovalName?: string;
  timesheetApprovalLocation?: string;
  pricing: Pricing;
  customer?: string;
  endCustomer?: string;
  startDate?: Date;
  endDate?: Date;
  //#endregion

  //#region linked properties -------------------------------------------------
  parentId?: number;
  categories?: DtoCategoryList;
  workPackageTypes?: DtoWorkPackageTypeList
  //#endregion

}
