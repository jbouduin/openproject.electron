import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@core';
import { MainComponent } from './components/main/main.component';
import { WorkPackagesComponent } from './components/work-packages/work-packages.component';
import { WorkPackageTableComponent } from './components/work-package-table/work-package-table.component';
import { OpenInvoicesComponent } from './components/open-invoices/open-invoices.component';



@NgModule({
  declarations: [
    MainComponent,
    WorkPackagesComponent,
    WorkPackageTableComponent,
    OpenInvoicesComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CoreModule
  ]
})
export class DashboardModule { }
