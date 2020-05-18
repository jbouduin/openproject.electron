import { DtoBase } from '../dto-base';

export interface DtoTimeEntry extends DtoBase {
  activityId: number;
  activityTitle: string;
  comment: string;
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
