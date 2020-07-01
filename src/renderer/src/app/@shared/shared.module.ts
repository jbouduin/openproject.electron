import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Iso8601TimespanPipe } from './pipes/iso8601-timespan.pipe';
import { ProjectTreeComponent } from './components/project-tree/project-tree.component';
import { CoreModule } from '@core';

import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { FloatingButtonComponent } from './components/floating-button/floating-button.component';

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    Iso8601TimespanPipe,
    ProjectTreeComponent,
    FloatingButtonComponent
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
    ProjectTreeComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ],
  providers: [],
})
export class SharedModule { }
