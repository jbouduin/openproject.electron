import { DtoBase } from '../dto-base';
import { DtoBaseList } from '../dto-base-list';
import { DtoFormattableText } from '../dto-formattable-text';
import { DtoProject } from '../project/dto-project';

export type DtoInvoiceList = DtoBaseList<DtoInvoice>;

export interface DtoInvoice extends DtoBase {
  subject: string;
  description: DtoFormattableText;
  invoiceDate: Date;
  dueDate: Date;
  project: DtoProject;
  netAmount: number;
}
