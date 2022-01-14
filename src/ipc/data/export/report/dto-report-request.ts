import { DtoBaseExportRequest } from '../dto-export-request';

export interface DtoReportRequest extends DtoBaseExportRequest {
  month: number;
  year: number;
}