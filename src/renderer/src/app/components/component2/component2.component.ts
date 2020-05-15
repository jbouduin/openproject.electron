import { Component, OnInit } from '@angular/core';

import { CacheService } from '@core';
import { DataVerb, DtoSystemInfo, DtoUntypedDataRequest } from '@ipc';
import { DtoProject } from '@ipc';

@Component({
  selector: 'app-component2',
  templateUrl: './component2.component.html',
  styleUrls: ['./component2.component.scss']
})
export class Component2Component implements OnInit {

  public projects: Array<DtoProject>;

  constructor(private cacheService: CacheService) {
    this.projects = new Array<DtoProject>();
  }

  ngOnInit() {
    this.cacheService.projects().then(projects => this.projects = projects);
  }
}
