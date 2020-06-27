import { DtoBase } from '../dto-base';
import { DtoFormattableText } from '../dto-formattable-text';

export interface DtoWorkPackage extends DtoBase {
  lockVersion: number;
  subject: string;
  description: DtoFormattableText;
  startDate: Date;
  dueDate: Date;
}
