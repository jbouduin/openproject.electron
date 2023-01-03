import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupDialogComponent } from './components/setup-dialog/setup-dialog.component';
import { CoreModule } from '@core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [
    SetupDialogComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [
    SetupDialogComponent
  ]
})
export class ExportModule { }
