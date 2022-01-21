import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoProject } from '../project/dto-project';
import { DtoWorkPackage } from '../work-package/dto-work-package';
import { DtoTimeEntryActivity } from './dto-time-entry-activity';

export type DtoTimeEntryList = DtoBaseList<DtoTimeEntry>;

export interface DtoTimeEntry extends DtoBase {
  activity: DtoTimeEntryActivity;
  comment: DtoFormattableText;
  start: string;
  end: string;
  hours: string;
  project: DtoProject;
  spentOn: Date;
  userId: number;
  userName: string;
  workPackage: DtoWorkPackage;
  billed: boolean;
}
