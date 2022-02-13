import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataRequestFactory, IpcService } from '@core';
import { DataVerb, DtoDataResponse, DtoSystemInfo } from '@ipc';
import { CacheDialogComponent } from '../cache-dialog/cache-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private readonly matDialog: MatDialog;
  private readonly ipcService: IpcService;
  private readonly dataRequestFactory: DataRequestFactory;
  //#endregion

  //#region public properties -------------------------------------------------
  public arch: string;
  public hostname: string;
  public platform: string;
  public release: string;
  public coreVersion: string;
  public instanceName: string;
  public userName: string;
  public host: string;
  public apiRoot: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    matDialog: MatDialog,
    ipcService: IpcService,
    dataRequestFactory: DataRequestFactory) {
    this.matDialog = matDialog;
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
  }

  public ngOnInit(): void {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/system-info');
    this.ipcService
      .untypedDataRequest<DtoSystemInfo>(request)
      .then(
        (response: DtoDataResponse<DtoSystemInfo>) => {
          this.arch = response.data.osInfo.arch;
          this.hostname = response.data.osInfo.hostname;
          this.platform = response.data.osInfo.platform;
          this.release = response.data.osInfo.release;
          this.coreVersion = response.data.openprojectInfo.coreVersion;
          this.instanceName = response.data.openprojectInfo.instanceName;
          this.userName = response.data.openprojectInfo.userName;
          this.host = response.data.openprojectInfo.host;
          this.apiRoot = response.data.openprojectInfo.apiRoot;
        },
        (reason: any) => console.error(reason));
  }
  //#endregion

  //#region UI triggers--------------------------------------------------------
  public cacheButtonClick(): void {
    this.matDialog.open(
      CacheDialogComponent,
      {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%'
      }
    );
  }
  //#endregion
}
