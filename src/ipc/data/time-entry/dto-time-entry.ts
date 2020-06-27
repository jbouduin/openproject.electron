import { DtoBase } from '../dto-base';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoTimeEntryActivity } from './dto-time-entry-activity';

export interface DtoTimeEntry extends DtoBase {
  activity: DtoTimeEntryActivity;
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
