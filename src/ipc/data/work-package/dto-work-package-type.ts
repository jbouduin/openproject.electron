import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';

export type DtoWorkPackageTypeList = DtoBaseList<DtoWorkPackageType>;

export interface DtoWorkPackageType extends DtoBase {
  name: string;
  color: string;
  position: number;
  isDefault: boolean,
  isMilestone: boolean,
}
