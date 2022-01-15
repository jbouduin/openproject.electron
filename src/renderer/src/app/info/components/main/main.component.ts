import { Component, OnInit } from '@angular/core';
import { DataRequestFactory, IpcService } from '@core';
import { DataVerb, DtoDataResponse, DtoSystemInfo } from '@ipc';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;

  public arch: string;
  public hostname: string;
  public platform: string;
  public release: string;
  public coreVersion: string;
  public instanceName: string;
  public userName: string;
  public host: string;
  public apiRoot: string;

  constructor(ipcService: IpcService, dataRequestFactory: DataRequestFactory) {
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
  }

  ngOnInit(): void {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/system-info');
    this.ipcService.untypedDataRequest<DtoSystemInfo>(request).then((response: DtoDataResponse<DtoSystemInfo>) => {
      console.log(response.data);
      this.arch = response.data.osInfo.arch;
      this.hostname = response.data.osInfo.hostname;
      this.platform = response.data.osInfo.platform;
      this.release = response.data.osInfo.release;
      this.coreVersion = response.data.openprojectInfo.coreVersion;
      this.instanceName = response.data.openprojectInfo.instanceName;
      this.userName = response.data.openprojectInfo.userName;
      this.host = response.data.openprojectInfo.host;
      this.apiRoot = response.data.openprojectInfo.apiRoot;
    })
  }

}
