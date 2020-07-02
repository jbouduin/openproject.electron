import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupDialogComponent } from './components/setup-dialog/setup-dialog.component';
import { CoreModule } from '@core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    SetupDialogComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    FlexLayoutModule
  ],
  entryComponents: [
    SetupDialogComponent
  ]
})
export class ExportModule { }
