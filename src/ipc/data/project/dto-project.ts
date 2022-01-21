import { Pricing } from '@common';
import { DtoWorkPackageTypeList } from '../work-package/dto-work-package-type';
import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoCategoryList } from './dto-category';

export type DtoProjectList = DtoBaseList<DtoProject>;

export interface DtoProject extends DtoBase {
  //#region properties from HalResource ---------------------------------------
  description: DtoFormattableText;
  identifier: string;
  name: string;
  parentId?: number;
  timesheetApprovalName?: string;
  timesheetApprovalLocation?: string;
  pricing: Pricing;
  //#endregion

  //#region linked properties -------------------------------------------------
  categories?: DtoCategoryList;
  workPackageTypes?: DtoWorkPackageTypeList
  //#endregion

}
