import { Pricing } from '@common';
import { DtoBase } from '../dto-base';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoCategoryList } from './dto-category-list';

export interface DtoProject extends DtoBase {
  categories?: DtoCategoryList;
  description: DtoFormattableText;
  identifier: string;
  name: string;
  parentId?: number;
  timesheetApprovalName?: string;
  timesheetApprovalLocation?: string;
  pricing?: Pricing;
}
