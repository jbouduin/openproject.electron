import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Iso8601TimespanPipe } from './pipes/iso8601-timespan.pipe';



@NgModule({
  declarations: [Iso8601TimespanPipe],
  imports: [
    CommonModule
  ],
  exports: [Iso8601TimespanPipe],
  providers: [],
})
export class SharedModule { }
