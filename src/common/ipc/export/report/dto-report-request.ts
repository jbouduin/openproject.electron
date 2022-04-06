import { DtoBaseExportRequest } from '../dto-export-request';

export interface DtoReportRequest<T> extends DtoBaseExportRequest {
  selection: T
}