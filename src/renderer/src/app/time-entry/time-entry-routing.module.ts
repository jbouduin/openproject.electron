import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeEntryMainComponent } from './components/time-entry/time-entry-main.component';

const routes: Routes = [
  { path:  'time-entry', component:  TimeEntryMainComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class TimeEntryRoutingModule { }
