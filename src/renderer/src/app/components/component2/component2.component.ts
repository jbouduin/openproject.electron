import { Component, OnInit } from '@angular/core';

import { IpcService } from '@core';
import { DataVerb, DtoSystemInfo, DtoUntypedDataRequest } from '@ipc';

@Component({
  selector: 'app-component2',
  templateUrl: './component2.component.html',
  styleUrls: ['./component2.component.css']
})
export class Component2Component implements OnInit {

  public projects: Array<string>;

  constructor(private ipcService: IpcService) {
    this.projects = new Array<string>();
  }

  ngOnInit() {
    const request: DtoUntypedDataRequest = {
      verb: DataVerb.GET,
      path: '/projects',
    };

    this.ipcService
      .untypedDataRequest<Array<string>>(request)
      .then(response => this.projects = response.data);
  }
}
