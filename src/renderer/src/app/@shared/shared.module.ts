import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Iso8601TimespanPipe } from './pipes/iso8601-timespan.pipe';
import { ProjectTreeComponent } from './components/project-tree/project-tree.component';
import { CoreModule } from '@core';

@NgModule({
  declarations: [
    Iso8601TimespanPipe,
    ProjectTreeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule
  ],
  exports: [
    Iso8601TimespanPipe,
    ProjectTreeComponent
  ],
  providers: [],
})
export class SharedModule { }
