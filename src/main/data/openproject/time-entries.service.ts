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

  // <editor-fold desc='Private properties'>
  private timeEntryAdapter: ITimeEntryAdapter;
  private timeEntryListAdapter: ITimeEntryListAdapter
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.TimeEntryAdapter) timeEntryAdapter: ITimeEntryAdapter,
    @inject(ADAPTERTYPES.TimeEntryListAdapter) timeEntryListAdapter: ITimeEntryListAdapter) {
    super(logService, openprojectService);
    this.timeEntryAdapter = timeEntryAdapter;
    this.timeEntryListAdapter = timeEntryListAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.delete('/time-entries/:id', this.deleteEntry.bind(this));
    router.get('/time-entries', this.getTimeEntries.bind(this));
    router.patch('/time-entries', this.patchEntry.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private async deleteEntry(request: RoutedRequest): Promise<DtoDataResponse<any>> {
    let response: DtoDataResponse<any>;
    try {
      const uri = `/time_entries/${request.params.id}`;
      await this.openprojectService.deleteResource(uri);
      response = {
        status: DataStatus.Ok,
        data: undefined
      };
    }
    catch (err) {
      response = this.processServiceError(err);
    }
    return response;
  }

  private async getTimeEntries(request: RoutedRequest): Promise<DtoDataResponse<DtoTimeEntryList>> {
    let response: DtoDataResponse<DtoTimeEntryList>;
    const uri = this.buildUriWithFilter('/time_entries', request.data);
    try {
      const halResource = await this.openprojectService.fetchResource(uri);
      const result = this.timeEntryListAdapter.resourceToDto(this.timeEntryAdapter, halResource);
      response = {
        status: DataStatus.Ok,
        data: result
      };
    }
    catch (err) {
      response = this.processServiceError(err);
    }
    return response;
  }

  private async patchEntry(request: RoutedRequest): Promise<DtoDataResponse<any>> {
    console.log(JSON.stringify(request, null, 2));
    let response: DtoDataResponse<any>;
    try {
      // const uri = `/time_entries/${request.params.id}`;
      response = {
        status: DataStatus.Error,
        data: undefined
      };
      return response;
    }
    catch (err) {
      response = this.processServiceError(err);
    }
    return Promise.resolve(response);
  }
  // </editor-fold>
}
