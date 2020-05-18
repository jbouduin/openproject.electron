import { DtoBase } from '../dto-base';
import { DtoFormattableText } from '../dto-formattable-text';

export interface DtoTimeEntry extends DtoBase {
  activityId: number;
  activityTitle: string;
  comment: DtoFormattableText;
  customField2: string;
  customField3: string;
  hours: string;
  projectId: number;
  spentOn: Date;
  userId: number;
  userTitle: string;
  workPackageId: number;
  workPackageTitle: string;
}
