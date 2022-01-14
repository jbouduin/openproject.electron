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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Component1Component } from './components/component1/component1.component';

@NgModule({
  declarations: [
    AppComponent,
    Component1Component
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
    ShellModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
