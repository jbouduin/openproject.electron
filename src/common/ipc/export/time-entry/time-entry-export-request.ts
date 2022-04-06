import { DtoTimeEntry } from '../../time-entry/dto-time-entry';
import { DtoExportRequest } from '../dto-export-request';
import { TimeEntryLayoutLines } from './time-entry-layout-lines';
import { TimeEntryLayoutSubtotal } from './time-entry-layout-subtotal';

export interface DtoTimeEntryExportRequest extends DtoExportRequest<Array<DtoTimeEntry>> {
  approvalName?: string;
  approvalLocation?:string;
  includeSignatureTable: boolean;
  layoutLines: TimeEntryLayoutLines;
  subtotal: TimeEntryLayoutSubtotal;
  title: Array<string>;
}
