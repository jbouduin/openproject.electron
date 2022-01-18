import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MainComponent } from './components/main/main.component';
import { MonthlyReportComponent } from './components/month/monthly-report.component';
import { ProjectReportComponent } from './components/project/project-report.component';
import { AbsenceReportComponent } from './components/absence/absence-report.component';

@NgModule({
  declarations: [
    MainComponent,
    MonthlyReportComponent,
    ProjectReportComponent,
    AbsenceReportComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    FlexLayoutModule
  ]
})
export class ReportModule { }
