import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ITimeEntryCollectionAdapter, ITimeEntryEntityAdapter } from '@adapters';
import { TimeEntryCollectionModel } from '@core/hal-models';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse, DtoTimeEntryList } from '@ipc';
import { BaseDataService } from '../base-data-service';
import { IDataRouterService } from '../data-router.service';
import { IDataService } from '../data-service';
import { RoutedRequest } from '../routed-request';

import ADAPTERTYPES from '@adapters/adapter.types';
import SERVICETYPES from '@core/service.types';

export interface ITimeEntriesService extends IDataService { }

@injectable()
export class TimeEntriesService extends BaseDataService implements ITimeEntriesService {

  // <editor-fold desc='Private properties'>
  private timeEntryCollectionAdapter: ITimeEntryCollectionAdapter;
  private timeEntryEntityAdapter: ITimeEntryEntityAdapter
  // </editor-fold>

  // <editor-fold desc='Protected abstract getters implementation'>
  protected get entityRoot(): string { return '/time_entries'; };
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.TimeEntryCollectionAdapter) timeEntryCollectionAdapter: ITimeEntryCollectionAdapter,
    @inject(ADAPTERTYPES.TimeEntryEntityAdapter) timeEntryEntityAdapter: ITimeEntryEntityAdapter) {
    super(logService, openprojectService);
    this.timeEntryCollectionAdapter = timeEntryCollectionAdapter;
    this.timeEntryEntityAdapter = timeEntryEntityAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.delete('/time-entries/:id', this.deleteEntry.bind(this));
    router.get('/time-entries', this.getTimeEntries.bind(this));
    router.post('/time-entries/:id/form', this.updateEntry.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private async deleteEntry(request: RoutedRequest): Promise<DtoDataResponse<any>> {
    let response: DtoDataResponse<any>;
    try {
      const uri = `${this.entityRoot}/${request.params.id}`;
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
    const uri = this.buildUriWithFilter(this.entityRoot, request.data);
    try {
      const collection = await this.openprojectService.fetch(uri, TimeEntryCollectionModel);
      const result = await this.timeEntryCollectionAdapter.resourceToDto(this.timeEntryEntityAdapter, collection);
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

  private async updateEntry(request: RoutedRequest): Promise<DtoDataResponse<any>> {
    // console.log(JSON.stringify(request, null, 2));
    this.getUpdateForm(request.params.id);
    let response: DtoDataResponse<any>;
    try {
      // const uri = `${this.entityRoot}/${request.params.id}`;
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
