import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './components/main/main.component';
import { WorkPackagesComponent } from './components/work-packages/work-packages.component';



@NgModule({
  declarations: [MainComponent, WorkPackagesComponent],
  imports: [
    CommonModule
  ]
})
export class DashboardModule { }
