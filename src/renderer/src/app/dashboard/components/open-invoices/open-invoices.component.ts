import { Component, OnInit } from '@angular/core';
import { WorkPackageService } from '@core';
import { DtoBaseFilter, DtoWorkPackage, DtoWorkPackageList } from '@common';
import { WorkPackageTypeMap } from '@common';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceDialogComponent } from 'src/app/invoice/components/invoice-dialog/invoice-dialog.component';
import { StatusService } from '@core/status.service';

@Component({
  selector: 'open-invoices',
  templateUrl: './open-invoices.component.html',
  styleUrls: ['./open-invoices.component.scss']
})
export class OpenInvoicesComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private matDialog: MatDialog;
  private workPackageService: WorkPackageService;
  private filter: DtoBaseFilter;
  private statusService: StatusService;
  //#endregion

  //#region Public properties -------------------------------------------------
  public displayedColumns: Array<string>;
  public invoices: Array<DtoWorkPackage>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    matDialog: MatDialog,
    statusService: StatusService,
    workPackageService: WorkPackageService) {
    this.matDialog = matDialog;
    this.statusService = statusService;
    this.workPackageService = workPackageService;
    this.displayedColumns = new Array<string>(
      'invoiceNumber',
      'invoiceDate',
      'amount',
      'project',
      'customer'
    );
    this.invoices = new Array<DtoWorkPackage>();
    this.filter = undefined;
  }

  public ngOnInit(): void {
    this.statusService.statusChange.subscribe((status: string) => {
      if (status === 'ready') {
        // this.zone.run(() => {
          this.refresh();
        //   this.refreshInvoices();;
        // });
      }
    });
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public refresh(): void {
    this.invoices = new Array<DtoWorkPackage>();
    this.loadWorkPackageTypes().then(() => {
      this.workPackageService
        .loadWorkPackages(this.filter)
        .then((response: DtoWorkPackageList) => this.invoices = response.items);
    });
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
    );
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private async loadWorkPackageTypes(): Promise<void> {
    if (!this.filter) {
      const workPackageTypes = await this.workPackageService.loadWorkPackageTypes();
      const invoiceTypeId = new Array<number>();
      invoiceTypeId.push(workPackageTypes.find(t => t.name === WorkPackageTypeMap.Invoice).id);
      const filters = new Array<any>();
      filters.push({
        'status_id': {
          'operator': 'o',
          'values': null
        }
      });
      filters.push({
        'type_id': {
          'operator': '=',
          'values': invoiceTypeId
        }
      });
      this.filter = {
        offset: 1,
        pageSize: 50,
        filters: JSON.stringify(filters)
      };
    }
  }
  //#endregion
}
