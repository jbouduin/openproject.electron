import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Iso8601TimespanPipe } from './pipes/iso8601-timespan.pipe';
import { ProjectTreeComponent } from './components/project-tree/project-tree.component';
import { CoreModule } from '@core';

import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { FloatingButtonComponent } from './components/floating-button/floating-button.component';
import { PdfCommonComponent } from './components/pdf-common/pdf-common.component';
import { NumericTwoDecimalsDirective } from './directives/numeric-two-decimals.directive';

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    Iso8601TimespanPipe,
    ProjectTreeComponent,
    FloatingButtonComponent,
    PdfCommonComponent,
    NumericTwoDecimalsDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule
  ],
  exports: [
    Iso8601TimespanPipe,
    FloatingButtonComponent,
    ProjectTreeComponent,
    PdfCommonComponent,
    NumericTwoDecimalsDirective
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ],
  providers: [],
})
export class SharedModule { }
