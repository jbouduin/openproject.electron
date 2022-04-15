import { Component, NgZone, OnInit } from '@angular/core';
import { DtoInvoice, DtoInvoiceList } from '@common';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceDialogComponent } from 'src/app/invoice/components/invoice-dialog/invoice-dialog.component';
import { StatusService } from '@core/status.service';
import { InvoiceService } from '@core/invoice.service';

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
    statusService: StatusService,
    invoiceService: InvoiceService) {
    this.zone = zone;
    this.matDialog = matDialog;
    this.statusService = statusService;
    this.invoiceService = invoiceService;

    this.displayedColumns = new Array<string>(
      'invoiceNumber',
      'invoiceDate',
      'amount',
      'project',
      'customer'
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
    this.matDialog.open(
      InvoiceDialogComponent,
      {
        height: '520px',
        width: '630px',
        maxWidth: '100vw',
        maxHeight: '100vh'
      }
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
  //#endregion
}
