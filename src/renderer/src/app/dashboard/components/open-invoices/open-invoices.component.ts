import { Component, NgZone, OnInit } from '@angular/core';
import { DtoInvoice, DtoInvoiceList } from '@common';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceDialogComponent } from 'src/app/invoice/components/invoice-dialog/invoice-dialog.component';
import { StatusService } from '@core/status.service';
import { InvoiceService } from '@core/invoice.service';
import { ConfirmationDialogService } from '@shared';
import { InvoiceDialogParams } from 'src/app/invoice/components/invoice-dialog/invoice-dialog.params';

@Component({
  selector: 'open-invoices',
  templateUrl: './open-invoices.component.html',
  styleUrls: ['./open-invoices.component.scss']
})
export class OpenInvoicesComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private matDialog: MatDialog;
  private invoiceService: InvoiceService;
  private statusService: StatusService;
  private confirmationDialogService: ConfirmationDialogService;
  private zone: NgZone
  //#endregion

  //#region Public properties -------------------------------------------------
  public displayedColumns: Array<string>;
  public invoices: Array<DtoInvoice>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    zone: NgZone,
    matDialog: MatDialog,
    confirmationDialogService: ConfirmationDialogService,
    statusService: StatusService,
    invoiceService: InvoiceService) {
    this.zone = zone;
    this.matDialog = matDialog;
    this.confirmationDialogService = confirmationDialogService;
    this.statusService = statusService;
    this.invoiceService = invoiceService;

    this.displayedColumns = new Array<string>(
      'invoiceNumber',
      'invoiceDate',
      'amount',
      'project',
      'customer',
      'actions'
    );
    this.invoices = new Array<DtoInvoice>();
  }

  public ngOnInit(): void {
    this.statusService.statusChange.subscribe((status: string) => {
      if (status === 'ready') {
        this.zone.run(() => {
          this.refresh();
        });
      }
    });
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public refresh(): void {
    this.invoices = new Array<DtoInvoice>();
    this.invoiceService.getOpenInvoices().then((result: DtoInvoiceList) => this.invoices = result.items);
  }

  public create(): void {
    const data: InvoiceDialogParams = {
      action: 'new'
    };
    this.matDialog.open(
      InvoiceDialogComponent,
      {
        height: 'auto',
        width: '630px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        panelClass: 'bg-color',
        data: new InvoiceDialogParams('new')
      },
    )
      .afterClosed()
      .subscribe((result: DtoInvoice | undefined) => {
        if (result) {
          const newList = new Array<DtoInvoice>(...this.invoices);
          newList.push(result);
          this.invoices = newList;
        }
      });
  }

  public pay(invoice: DtoInvoice): void {
    this.matDialog.open(
      InvoiceDialogComponent,
      {
        height: 'auto',
        width: '630px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        panelClass: 'bg-color',
        data: new InvoiceDialogParams('pay', invoice)
      },
    )
      .afterClosed()
      .subscribe((result: DtoInvoice | undefined) => {
        if (result) {
          this.invoices = this.invoices.filter((inv: DtoInvoice) => inv.id !== invoice.id);
        }
      });
  }

  public delete(invoice: DtoInvoice): void {
    this.confirmationDialogService.showQuestionDialog(
      `Are you sure you want to delete invoice ${invoice.subject}`,
      () => {
        this.invoiceService
          .deleteInvoice(invoice.id)
          .then((succeeded: boolean) => {
            if (succeeded) {
              this.invoices = this.invoices.filter((inv: DtoInvoice) => inv.id !== invoice.id);
            }
          });
      });
  }
  //#endregion
}
