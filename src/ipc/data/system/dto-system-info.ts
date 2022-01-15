import { DtoOpenprojectInfo } from './dto-openproject-info';
import { DtoOsInfo } from './dto-os-info';

export interface DtoSystemInfo {
  osInfo: DtoOsInfo;
  openprojectInfo: DtoOpenprojectInfo;
}
