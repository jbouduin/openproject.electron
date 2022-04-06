import { DtoBaseList } from '../dto-base-list';
import { DtoBase } from '../dto-base';

export type DtoTimeEntryActivityList = DtoBaseList<DtoTimeEntryActivity>;

export interface DtoTimeEntryActivity extends DtoBase {
  name: string;
  position: number;
  default: boolean;
}
