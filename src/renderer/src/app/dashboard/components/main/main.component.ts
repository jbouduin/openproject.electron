import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { StatusService } from '@core/status.service';
import { OpenInvoicesComponent } from '../open-invoices/open-invoices.component';
import { WorkPackagesComponent } from '../work-packages/work-packages.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private zone: NgZone;
  private statusService: StatusService;
  //#endregion

  //#region @input/@output@viewChild ------------------------------------------
  @ViewChild(WorkPackagesComponent) duePackages: WorkPackagesComponent;
  @ViewChild(OpenInvoicesComponent) invoices: OpenInvoicesComponent;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(zone: NgZone, statusService: StatusService) {
    this.zone = zone;
    this.statusService = statusService;
  }

  public ngOnInit(): void {
    this.statusService.statusChange.subscribe((status: string) => {
      if (status === 'ready') {
        this.zone.run(() => {
          this.refreshDue();
          this.refreshInvoices();;
        });
      }
    });
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public refreshDue(): void {
    this.duePackages.refresh();
  }

  public refreshInvoices(): void {
    this.invoices.refresh();
  }

  public createInvoice(): void {
    this.invoices.create();
  }
  //#endregion
}
