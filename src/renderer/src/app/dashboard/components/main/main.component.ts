import { Component, ViewChild } from '@angular/core';
import { OpenInvoicesComponent } from '../open-invoices/open-invoices.component';
import { WorkPackagesComponent } from '../work-packages/work-packages.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  //#region @input/@output@viewChild ------------------------------------------
  @ViewChild(WorkPackagesComponent) duePackages: WorkPackagesComponent;
  @ViewChild(OpenInvoicesComponent) invoices: OpenInvoicesComponent;
  //#endregion

  //#region public methods ----------------------------------------------------
  public refreshDue(): void{
    this.duePackages.refresh();
  }

  public refreshInvoices(): void {
    this.invoices.refresh();
  }
  //#endregion
}
