import { DtoBase } from '../dto-base';
import { DtoProject } from '../project/dto-project';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoWorkPackageType } from './dto-work-package-type';

export interface DtoWorkPackage extends DtoBase {
  lockVersion: number;
  subject: string;
  description: DtoFormattableText;
  startDate: Date;
  dueDate: Date;
  parent: DtoWorkPackage;
  project: DtoProject;
  type: DtoWorkPackageType;
}
