import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoProject } from '../project/dto-project';
import { DtoWorkPackageType } from './dto-work-package-type';

export type DtoWorkPackageList = DtoBaseList<DtoWorkPackage>;

export interface DtoWorkPackage extends DtoBase {
  lockVersion: number;
  subject: string;
  description: DtoFormattableText;
  startDate: Date;
  dueDate: Date;
  derivedStartDate: Date;
  derivedDueDate: Date;
  scheduleManually: boolean;
  parent: DtoWorkPackage;
  project: DtoProject;
  type: DtoWorkPackageType;
  billable?: boolean;
}
