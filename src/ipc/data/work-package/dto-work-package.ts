import { DtoBase } from '../dto-base';
import { DtoProject } from '../project/dto-project';
import { DtoFormattableText } from '../dto-formattable-text';

export interface DtoWorkPackage extends DtoBase {
  lockVersion: number;
  subject: string;
  description: DtoFormattableText;
  startDate: Date;
  dueDate: Date;
  project: DtoProject;
}
