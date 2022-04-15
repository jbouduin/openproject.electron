import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '@core';
import { ShellModule } from './shell/shell.module';
import { ExportModule } from './export/export.module';

import { DashboardModule } from './dashboard/dashboard.module';
import { DashboardRoutingModule } from './dashboard/dashboard-routing.module';
import { ReportModule } from './report/report.module';
import { ReportRoutingModule } from './report/report-routing.module';
import { TimeEntryModule } from './time-entry/time-entry.module';
import { TimeEntryRoutingModule } from './time-entry/time-entry-routing.module';
import { InvoiceModule } from './invoice/invoice.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InfoModule } from './info/info.module';
import { InfoRoutingModule } from './info/info-routing.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    DashboardModule,
    DashboardRoutingModule,
    ExportModule,
    ReportModule,
    ReportRoutingModule,
    TimeEntryModule,
    TimeEntryRoutingModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ShellModule,
    InfoModule,
    InfoRoutingModule,
    InvoiceModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
