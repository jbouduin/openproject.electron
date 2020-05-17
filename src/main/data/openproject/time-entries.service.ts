import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { ITimeEntryAdapter, ITimeEntryListAdapter } from '@adapters';
import { IDataRouterService, RoutedRequest } from '@data';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse } from '@ipc';
import { DtoTimeEntry, DtoTimeEntryList } from '@ipc';

import { IDataService } from '../data-service';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';

export interface ITimeEntriesService extends IDataService { }

@injectable()
export class TimeEntriesService implements ITimeEntriesService {

  // <editor-fold desc='Constructor & C°'>
  public constructor(

    @inject(SERVICETYPES.LogService) private logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) private openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.TimeEntryAdapter) private timeEntryAdapter: ITimeEntryAdapter,
    @inject(ADAPTERTYPES.TimeEntryListAdapter) private timeEntryListAdapter: ITimeEntryListAdapter) { }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/time-entries', this.getTimeEntries.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private getTimeEntries(request: RoutedRequest): Promise<DtoDataResponse<DtoTimeEntryList>> {
    return this.openprojectService.fetchResource('/time_entries').then(
      halResource => {
        const result = this.timeEntryListAdapter.adapt(this.timeEntryAdapter, halResource);
        const response: DtoDataResponse<DtoTimeEntryList> = {
          status: DataStatus.Ok,
          data: result
        };
        return response;
      },
      err => {
        const response: DtoDataResponse<DtoTimeEntryList> = {
          status: DataStatus.Error,
          message: `${err.name}: ${err.message}`
        };
        return response;
      }
    );
  }
  // </editor-fold>
}
