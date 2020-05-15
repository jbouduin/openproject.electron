import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { IDataRouterService, RoutedRequest } from '@data';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse } from '@ipc';
import { DtoTimeEntry } from '@ipc';

import { IDataService } from '../data-service';

import SERVICETYPES from '../../@core/service.types';

export interface ITimeEntriesService extends IDataService { }

@injectable()
export class TimeEntriesService implements ITimeEntriesService {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) private logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) private openprojectService: IOpenprojectService) { }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/time-entries', this.getTimeEntries.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private getTimeEntries(request: RoutedRequest): Promise<DtoDataResponse<Array<DtoTimeEntry>>> {
    // this.openprojectService.fetchResource('/time_entries').then(
    //   halResource => console.log(halResource));
    const response: DtoDataResponse<Array<DtoTimeEntry>> = {
      status: DataStatus.Ok,
      data: new Array<DtoTimeEntry>()
    };
    return Promise.resolve(response);
  }
  // </editor-fold>
}
