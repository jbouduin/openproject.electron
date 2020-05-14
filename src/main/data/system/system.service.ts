import { injectable } from 'inversify';
import * as os from 'os';
import 'reflect-metadata';

import { DataStatus, DtoDataResponse } from '@ipc';
import { DtoSystemInfo } from '@ipc';

import { IDataRouterService } from '../data-router.service';
import { IDataService } from '../data-service';
import { RoutedRequest } from '../routed-request';


export interface ISystemService extends IDataService { }

@injectable()
export class SystemService implements ISystemService {

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>

  // <editor-fold desc='ISomeService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/system-info', this.getSystemInfo);
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private getSystemInfo(request: RoutedRequest): Promise<DtoDataResponse<DtoSystemInfo>> {
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
  // </editor-fold>
}
