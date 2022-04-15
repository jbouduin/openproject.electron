import { DtoInvoice } from "../../../../../../common/ipc/work-package/dto-invoice";

export type InvoiceDialogAction = 'new' | 'pay';

export class InvoiceDialogParams {
  //#region public properties -----------------------------
  public readonly action: InvoiceDialogAction;
  public readonly invoice?: DtoInvoice;
  //#endregion

  //#region Constructor & C° ------------------------------
  public constructor(action: InvoiceDialogAction, invoice?: DtoInvoice) {
    this.action = action;
    this.invoice = invoice;
  }
  //#endregion
}