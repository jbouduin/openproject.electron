import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MainComponent } from './components/main/main.component';
import { ListComponent } from './components/list/list.component';
import { SelectionComponent } from './components/selection/selection.component';
import { EditDialogComponent } from './components/edit-dialog/edit-dialog.component';



@NgModule({
  declarations: [
    EditDialogComponent,
    ListComponent,
    MainComponent,
    SelectionComponent],
  entryComponents: [
    EditDialogComponent
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
export class TimeEntryModule { }
