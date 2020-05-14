import { Component, OnInit } from '@angular/core';

import { IpcService } from '@core';
import { DataVerb, DtoSystemInfo, DtoUntypedDataRequest } from '@ipc';
import { DtoProject } from '@ipc';

@Component({
  selector: 'app-component2',
  templateUrl: './component2.component.html',
  styleUrls: ['./component2.component.scss']
})
export class Component2Component implements OnInit {

  public projects: Array<DtoProject>;

  constructor(private ipcService: IpcService) {
    this.projects = new Array<DtoProject>();
  }

  ngOnInit() {
    const request: DtoUntypedDataRequest = {
      verb: DataVerb.GET,
      path: '/projects',
    };

    this.ipcService
      .untypedDataRequest<Array<DtoProject>>(request)
      .then(response => this.projects = response.data);
  }
}
