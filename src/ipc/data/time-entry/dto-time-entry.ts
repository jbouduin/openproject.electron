import { DtoBase } from '../dto-base';

export interface DtoTimeEntry extends DtoBase {
  comment: string;
  spentOn: Date;
  hours: string;
}
