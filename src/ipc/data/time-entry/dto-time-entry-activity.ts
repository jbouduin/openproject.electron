import { DtoBaseList } from '..';
import { DtoBase } from '../dto-base';

export type DtoTimeEntryActivityList = DtoBaseList<DtoTimeEntryActivity>;

export interface DtoTimeEntryActivity extends DtoBase {
  name: string;
  position: number;
  default: boolean;
}
