import { DtoWorkPackageType } from './dto-work-package-type'
import { DtoWorkPackageStatus} from './dto-work-package-status';

export interface DtoWorkPackagesByTypeAndStatus {
  workPackageType: DtoWorkPackageType;
  workPackageStatus: DtoWorkPackageStatus;
  count: number;
}