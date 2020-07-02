import { dialog, BrowserWindow, SaveDialogOptions } from 'electron';
import { injectable } from 'inversify';
import * as os from 'os';
import 'reflect-metadata';

import { IDataRouterService, RoutedRequest } from '@data';
import { DataStatus, DtoDataResponse } from '@ipc';
import { DtoSystemInfo } from '@ipc';

import { IDataService } from '../data-service';

export interface ISystemService extends IDataService {
  injectWindow(browserWindow: BrowserWindow): void;
}

@injectable()
export class SystemService implements ISystemService {

  // <editor-fold desc='Private properties'>
  private browserWindow: BrowserWindow
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>

  // <editor-fold desc='ISomeService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/system-info', this.getSystemInfo);
    router.get('/save-as/:purpose', this.saveAs.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  public injectWindow(browserWindow: BrowserWindow): void {
    this.browserWindow = browserWindow;
  }

  private getSystemInfo(_request: RoutedRequest): Promise<DtoDataResponse<DtoSystemInfo>> {
    const dtoSystemInfo: DtoSystemInfo = {
      arch: os.arch(),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release()
    };

    const response: DtoDataResponse<DtoSystemInfo> = {
      status: DataStatus.Ok,
      data: dtoSystemInfo
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
            { extensions: ['*.pdf'], name: 'Portable Document Format (*.pdf)' },
            { extensions: ['*.*'], name: 'All files (*.*)' }
          ]
        };
        break;
      }
      default: {
        options = {
          title: 'Save as',
          filters: [ { extensions: ['*.*'], name: 'All files (*.*)' } ]
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
