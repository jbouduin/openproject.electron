import { dialog, BrowserWindow, SaveDialogOptions } from 'electron';
import { injectable } from 'inversify';
import * as os from 'os';
import 'reflect-metadata';

import { IDataRouterService, RoutedRequest } from '@data';
import { DataStatus, DtoDataResponse, DtoOpenprojectInfo, DtoOsInfo } from '@ipc';
import { DtoSystemInfo } from '@ipc';

import { IRoutedDataService } from '../routed-data-service';

export interface ISystemService extends IRoutedDataService {
  initialize(browserWindow: BrowserWindow, openProjectInfo: DtoOpenprojectInfo): void;
}

@injectable()
export class SystemService implements ISystemService {

  //#region Private properties'
  private browserWindow: BrowserWindow;
  private openProjectInfo: DtoOpenprojectInfo;
  //#endregion

  //#region Constructor & C°
  public constructor() { }
  //#endregion

  //#region IDataService Interface methods
  public setRoutes(router: IDataRouterService): void {
    router.get('/system-info', this.getSystemInfo.bind(this));
    router.get('/save-as/:purpose', this.saveAs.bind(this));
  }
  //#endregion

  //#region ISystemService interface methods
  public initialize(browserWindow: BrowserWindow, openProjectInfo: DtoOpenprojectInfo): void {
    this.browserWindow = browserWindow;
    this.openProjectInfo = openProjectInfo;
  }
  //#endregion

  //#region GET routes callback
  private getSystemInfo(_request: RoutedRequest): Promise<DtoDataResponse<DtoSystemInfo>> {
    const osInfo: DtoOsInfo = {
      arch: os.arch(),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release()
    };

    const response: DtoDataResponse<DtoSystemInfo> = {
      status: DataStatus.Ok,
      data: {
        osInfo: osInfo,
        openprojectInfo: this.openProjectInfo
      }
    };

    return Promise.resolve(response);
  }

  private async saveAs(request: RoutedRequest): Promise<DtoDataResponse<string>> {
    let options: SaveDialogOptions;
    switch(request.params.purpose) {
      case 'export': {
        options = {
          title: 'Save export as',
          filters: [
            { extensions: ['pdf'], name: 'Portable Document Format (*.pdf)' },
            { extensions: ['*'], name: 'All files (*.*)' }
          ]
        };
        break;
      }
      default: {
        options = {
          title: 'Save as',
          filters: [ { extensions: ['*'], name: 'All files (*.*)' } ]
        };
      }
    }
    const saveAsResult = await dialog.showSaveDialog(this.browserWindow, options);
    const response: DtoDataResponse<string> = {
      status: DataStatus.Ok,
      data: saveAsResult.filePath
    };
    return response;
  }
  // </editor-fold>
}
