import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MainComponent } from './components/main/main.component';
import { ListComponent } from './components/list/list.component';
import { SelectionComponent } from './components/selection/selection.component';



@NgModule({
  declarations: [MainComponent, ListComponent, SelectionComponent],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule
  ]
})
export class TimeEntryModule { }
