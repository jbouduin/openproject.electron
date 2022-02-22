import { dialog, BrowserWindow, SaveDialogOptions } from 'electron';
import { injectable } from 'inversify';
import * as os from 'os';
import 'reflect-metadata';

import { IDataRouterService, RoutedRequest } from '@data';
import { DataStatus, DtoAppInfo, DtoDataResponse, DtoOpenprojectInfo, DtoOsInfo } from '@common';
import { DtoSystemInfo } from '@common';

import { IRoutedDataService } from '../routed-data-service';

export interface ISystemService extends IRoutedDataService {
  initialize(browserWindow: BrowserWindow, openProjectInfo: DtoOpenprojectInfo, appInfo: DtoAppInfo): void;
}

@injectable()
export class SystemService implements ISystemService {

  //#region Private properties' -----------------------------------------------
  private browserWindow: BrowserWindow;
  private openProjectInfo: DtoOpenprojectInfo;
  private appInfo: DtoAppInfo;
  //#endregion

  //#region IDataService Interface methods ------------------------------------
  public setRoutes(router: IDataRouterService): void {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.get('/system-info', this.getSystemInfo.bind(this));
    router.get('/save-as/:purpose', this.saveAs.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region ISystemService interface methods ----------------------------------
  public initialize(browserWindow: BrowserWindow, openProjectInfo: DtoOpenprojectInfo, appInfo: DtoAppInfo): void {
    this.browserWindow = browserWindow;
    this.openProjectInfo = openProjectInfo;
    this.appInfo = appInfo;
  }
  //#endregion

  //#region GET routes callback
  private getSystemInfo(): Promise<DtoDataResponse<DtoSystemInfo>> {
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
        openprojectInfo: this.openProjectInfo,
        appInfo: this.appInfo
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
