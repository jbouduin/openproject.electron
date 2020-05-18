import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeEntryComponent } from './components/time-entry/time-entry.component';

const routes: Routes = [
  { path:  'time-entry', component:  TimeEntryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class TimeEntryRoutingModule { }
