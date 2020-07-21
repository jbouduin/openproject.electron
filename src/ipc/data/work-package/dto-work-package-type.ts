import { DtoBase } from '../dto-base';

export interface DtoWorkPackageType extends DtoBase {
  name: string;
  color: string;
  position: number;
  isDefault: boolean,
  isMilestone: boolean,
}
