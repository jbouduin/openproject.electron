import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';

export type DtoWorkPackageStatusList = DtoBaseList<DtoWorkPackageStatus>;

export interface DtoWorkPackageStatus extends DtoBase {
  name: string;
  isCloses: boolean;
  color: string;
  isDefault: boolean;
  isReadonly: boolean;
  defaultDoneRatio: number;
  position: number;
}