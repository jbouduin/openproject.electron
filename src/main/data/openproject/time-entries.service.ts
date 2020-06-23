import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { ITimeEntryAdapter, ITimeEntryListAdapter } from '@adapters';
import { IDataRouterService, RoutedRequest } from '@data';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse, LogSource } from '@ipc';
import { DtoTimeEntryList } from '@ipc';

import { BaseDataService } from '../base-data-service';
import { IDataService } from '../data-service';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';

export interface ITimeEntriesService extends IDataService { }

@injectable()
export class TimeEntriesService extends BaseDataService implements ITimeEntriesService {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.TimeEntryAdapter) private timeEntryAdapter: ITimeEntryAdapter,
    @inject(ADAPTERTYPES.TimeEntryListAdapter) private timeEntryListAdapter: ITimeEntryListAdapter) {
    super(logService, openprojectService);
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.delete('/time-entries/:id', this.deleteEntry.bind(this));
    router.get('/time-entries', this.getTimeEntries.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private async deleteEntry(request: RoutedRequest): Promise<DtoDataResponse<any>> {
    try {
      const uri = `/time_entries/${request.params.id}`;
      await this.openprojectService.deleteResource(uri);
      const response: DtoDataResponse<any> = {
        status: DataStatus.Ok,
        data: undefined
      };
      return response;
    }
    catch (err) {
      let dataStatus: DataStatus;
      let message: string
      console.log('in error handler', err.response);
      if (err.response?.status) {
        switch (err.response.status) {
          case 403: {
            dataStatus = DataStatus.Forbidden;
            break;
          }
          case 404: {
            dataStatus = DataStatus.NotFound;
            break;
          }
          default: {
            dataStatus = DataStatus.Error;
          }
        }
        message = err.response.statusText;
        this.logService.error(
          LogSource.Main,
          {
            status: err.response.status,
            statusText: err.response.status,
            method: err.response.config.method,
            url: err.response.config.url,
            configData: err.response.config.data,
            data: err.response.data
          }
        );
      } else {
        dataStatus = DataStatus.Error;
        message = `${err.name}: ${err.message}`;
        this.logService.error(LogSource.Main, err);
      }

      const errorResponse: DtoDataResponse<any> = {
        status: dataStatus,
        message
      };
      return errorResponse;
    }
  }

  private async getTimeEntries(request: RoutedRequest): Promise<DtoDataResponse<DtoTimeEntryList>> {
    let uri = this.buildUri('/time_entries', request.data);
    try {
      const halResource = await this.openprojectService.fetchResource(uri);
      const result = this.timeEntryListAdapter.adapt(this.timeEntryAdapter, halResource);
      const response: DtoDataResponse<DtoTimeEntryList> = {
        status: DataStatus.Ok,
        data: result
      };
      return response;
    }
    catch (err) {
      this.logService.error(LogSource.Main, err);
      const errorResponse: DtoDataResponse<DtoTimeEntryList> = {
        status: DataStatus.Error,
        message: `${err.name}: ${err.message}`
      };
      return errorResponse;
    }
  }

  // </editor-fold>
}
