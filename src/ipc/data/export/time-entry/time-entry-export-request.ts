import { DtoTimeEntry } from '../../time-entry';
import { DtoExportRequest } from '../dto-export-request';
import { TimeEntryLayoutLines } from './time-entry-layout-lines';
import { TimeEntryLayoutSubtotal } from './time-entry-layout-subtotal';

export interface DtoTimeEntryExportRequest extends DtoExportRequest<Array<DtoTimeEntry>> {
  title: Array<string>;
  layoutLines: TimeEntryLayoutLines;
  subtotal: TimeEntryLayoutSubtotal;
}
