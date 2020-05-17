import { Component, OnInit } from '@angular/core';

import { DataRequestFactory, IpcService } from '@core';
import { DataVerb, DtoSystemInfo, DtoUntypedDataRequest } from '@ipc';

@Component({
  selector: 'app-component1',
  templateUrl: './component1.component.html',
  styleUrls: ['./component1.component.scss']
})
export class Component1Component implements OnInit {

  // <editor-fold desc='Public properties'>
  public arch!: string;
  public hostname!: string;
  public platform!: string;
  public release!: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private dataRequestFactory: DataRequestFactory, private ipcService: IpcService) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/system-info');

    this.ipcService.untypedDataRequest<DtoSystemInfo>(request)
      .then(
        response => {
          this.arch = response.data.arch;
          this.hostname = response.data.hostname;
          this.platform = response.data.platform;
          this.release = response.data.release;
        },
        error => alert(error.message)
      );
  }
}
