import { Component, OnInit } from '@angular/core';
import { WorkPackageService } from '@core';
import { DtoBaseFilter, DtoWorkPackage, DtoWorkPackageList } from '@ipc';
import { WorkPackageTypeMap } from '@common';

@Component({
  selector: 'open-invoices',
  templateUrl: './open-invoices.component.html',
  styleUrls: ['./open-invoices.component.scss']
})
export class OpenInvoicesComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private workPackageService: WorkPackageService;
  private filter: DtoBaseFilter;
  //#endregion

  //#region Public properties -------------------------------------------------
  public displayedColumns: Array<string>;
  public invoices: Array<DtoWorkPackage>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(workPackageService: WorkPackageService) {
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
    this.refresh();
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
