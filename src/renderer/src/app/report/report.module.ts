import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MainComponent } from './components/main/main.component';

@NgModule({
  declarations: [
    MainComponent,
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
