import { Component, OnInit, ViewChild } from '@angular/core';
import { WorkPackagesComponent } from '../work-packages/work-packages.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  @ViewChild(WorkPackagesComponent) duePackages: WorkPackagesComponent;

  public refreshDue(): void{
    this.duePackages.refresh();
  }
}
