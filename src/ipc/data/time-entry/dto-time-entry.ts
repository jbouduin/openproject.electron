import { DtoProject } from '../project/dto-project';
import { DtoWorkPackage } from '../work-package/dto-work-package';
import { DtoBase } from '../dto-base';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoTimeEntryActivity } from './dto-time-entry-activity';

export interface DtoTimeEntry extends DtoBase {
  activity: DtoTimeEntryActivity;
  comment: DtoFormattableText;
  customField2: string;
  customField3: string;
  hours: string;
  project: DtoProject;
  spentOn: Date;
  userId: number;
  userName: string;
  workPackage: DtoWorkPackage;
  customField5: boolean;
}
