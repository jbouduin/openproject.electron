import { DtoBase } from '../dto-base';

export interface DtoTimeEntryActivity extends DtoBase {
  name: string;
  position: number;
  default: boolean;
}
