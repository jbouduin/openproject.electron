import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { InvoiceDialogComponent } from './components/invoice-dialog/invoice-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    InvoiceDialogComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class InvoiceModule { }
