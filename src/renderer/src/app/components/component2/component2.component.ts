import { Component, OnInit } from '@angular/core';

import { CacheService } from '@core';
import { DataVerb, DtoSystemInfo, DtoUntypedDataRequest } from '@ipc';
import { DtoProject, DtoTimeEntry } from '@ipc';

@Component({
  selector: 'app-component2',
  templateUrl: './component2.component.html',
  styleUrls: ['./component2.component.scss']
})
export class Component2Component implements OnInit {

  public projects: Array<DtoProject>;
  public timeEntries: Array<DtoTimeEntry>;

  constructor(private cacheService: CacheService) {
    this.projects = new Array<DtoProject>();
    this.timeEntries = new Array<DtoTimeEntry>();
  }

  ngOnInit() {
    this.cacheService.projects().then(projects => this.projects = projects);
  }
}
