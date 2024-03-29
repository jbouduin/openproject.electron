import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ITimeEntryCollectionAdapter, ITimeEntryEntityAdapter, ITimeEntryFormAdapter, ISchemaAdapter } from '@adapters';
import { ILogService, IOpenprojectService } from '@core';
import { TimeEntryCollectionModel, TimeEntryFormModel, TimeEntryEntityModel, FormModel } from '@core/hal-models';
import { SchemaModel } from '@core/hal-models';
import { DataStatus, DtoDataResponse, DtoTimeEntryList, DtoBaseForm, DtoTimeEntry, DtoTimeEntryForm, DtoSchema, DtoBaseFilter } from '@common';
import { BaseDataService } from '../base-data-service';
import { IDataRouterService, RouteCallback } from '../data-router.service';
import { IRoutedDataService } from '../routed-data-service';
import { RoutedRequest } from '../routed-request';

import ADAPTERTYPES from '@adapters/adapter.types';
import SERVICETYPES from '@core/service.types';

export interface ITimeEntriesService extends IRoutedDataService {
  /**
   * retrieves all the time entries for the given month
   * @param month the month (1-base !)
   * @param year the year
   */
  getTimeEntriesForMonth(month: number, year: number): Promise<DtoTimeEntryList>;
  /**
   * retrieve all the time entries for the given project
   * @param projectId the project id
   */
  getTimeEntriesForProject(projectId: number): Promise<DtoTimeEntryList>;
}

@injectable()
export class TimeEntriesService extends BaseDataService implements ITimeEntriesService {

  //#region Private properties ------------------------------------------------
  private schemaAdapter: ISchemaAdapter;
  private timeEntryCollectionAdapter: ITimeEntryCollectionAdapter;
  private timeEntryEntityAdapter: ITimeEntryEntityAdapter;
  private timeEntryformAdapter: ITimeEntryFormAdapter;
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/time_entries'; }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.SchemaAdapter) schemaAdapter: ISchemaAdapter,
    @inject(ADAPTERTYPES.TimeEntryCollectionAdapter) timeEntryCollectionAdapter: ITimeEntryCollectionAdapter,
    @inject(ADAPTERTYPES.TimeEntryEntityAdapter) timeEntryEntityAdapter: ITimeEntryEntityAdapter,
    @inject(ADAPTERTYPES.TimeEntryFormAdapter) timeEntryformAdapter: ITimeEntryFormAdapter) {
    super(logService, openprojectService);
    this.schemaAdapter = schemaAdapter;
    this.timeEntryCollectionAdapter = timeEntryCollectionAdapter;
    this.timeEntryEntityAdapter = timeEntryEntityAdapter;
    this.timeEntryformAdapter = timeEntryformAdapter;
  }
  //#endregion

  //#region IDataService Interface methods ------------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.delete('/time-entries/:id', this.deleteEntry.bind(this) as RouteCallback);
    router.get('/time-entries', this.getTimeEntries.bind(this) as RouteCallback);
    router.get('/time-entries/form', this.timeEntryForm.bind(this) as RouteCallback);
    router.get('/time-entries/:id/form', this.timeEntryForm.bind(this) as RouteCallback);
    router.get('/time-entries/schema', this.timeEntrySchema.bind(this) as RouteCallback);
    router.post('/time-entries/form', this.saveTimeEntry.bind(this) as RouteCallback);
    router.post('/time-entries/set-billed', this.setTimeEntryBilled.bind(this) as RouteCallback);
    router.post('/time-entries/set-non-billed', this.setTimeEntryNonBilled.bind(this) as RouteCallback);
  }
  //#endregion

  //#region ITimeEntriesService members implementation ------------------------
  public async getTimeEntriesForMonth(month: number, year: number): Promise<DtoTimeEntryList> {
    const filters = new Array<any>();
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 1);
    filters.push(
      {
        'spent_on': {
          'operator': '<>d',
          'values': [
            new Intl.DateTimeFormat('de-DE').format(firstDay),
            new Intl.DateTimeFormat('de-DE').format(lastDay.setDate(lastDay.getDate() - 1))
          ]
        }
      }
    );
    const filter: DtoBaseFilter = {
      offset: 0,
      pageSize: 100,
      filters: JSON.stringify(filters)
    };
    return this.getTimeEntriesByUri(true, filter);
  }

  public async getTimeEntriesForProject(projectId: number): Promise<DtoTimeEntryList> {
    const filters = new Array<any>();

    filters.push(
      {
        'project': {
          'operator': '=',
          'values': [projectId]
        }
      }
    );
    const filter: DtoBaseFilter = {
      offset: 0,
      pageSize: 100,
      filters: JSON.stringify(filters)
    };
    return this.getTimeEntriesByUri(true, filter);
  }
  //#endregion

  //#region Delete routes callback --------------------------------------------
  private async deleteEntry(request: RoutedRequest<unknown>): Promise<DtoDataResponse<any>> {
    let response: DtoDataResponse<any>;
    try {
      const uri = `${this.entityRoot}/${request.params.id as number}`;
      await this.openprojectService.delete(uri);
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
  //#endregion

  //#region Get routes callbacks ----------------------------------------------
  private async getTimeEntries(request: RoutedRequest<DtoBaseFilter>): Promise<DtoDataResponse<DtoTimeEntryList>> {
    let response: DtoDataResponse<DtoTimeEntryList>;
    try {
      const list = await this.getTimeEntriesByUri(false, request.data);
      response = {
        status: DataStatus.Ok,
        data: list
      };
    } catch (err) {
      response = this.processServiceError(err);
    }
    return response;
  }

  private async timeEntryForm(routedRequest: RoutedRequest<DtoTimeEntryForm>): Promise<DtoDataResponse<DtoBaseForm<DtoTimeEntry>>> {
    let response: DtoDataResponse<DtoBaseForm<DtoTimeEntry>>;
    let uri: string;
    let data: Record<string, unknown>;

    if (routedRequest.data) {
      data = ((routedRequest.data).payload as unknown) as Record<string, unknown>;
      uri = (routedRequest.data).validate;
    } else {
      if (routedRequest.params.id) {
        uri = `${this.entityRoot}/${routedRequest.params.id as number}/form`;
      } else {
        uri = `${this.entityRoot}/form`;
      }
      data = {};
    }

    try {
      // GET without data means retrieve the form => maps to POST method in openproject
      // GET with data means validate the form => maps to POST method in openproject
      const form = await this.openprojectService.post(uri, data, TimeEntryFormModel);
      const result = await this.timeEntryformAdapter.resourceToDto(
        this.timeEntryEntityAdapter,
        form as FormModel<TimeEntryEntityModel>
      );
      response = {
        status: DataStatus.Ok,
        data: result
      }
    } catch (error) {
      return this.processServiceError(error);
    }
    return response;
  }

  private async timeEntrySchema(): Promise<DtoDataResponse<DtoSchema>> {
    let response: DtoDataResponse<DtoSchema>;
    try {
      const model = await this.openprojectService.fetch(`${this.entityRoot}/schema`, SchemaModel);
      const result = this.schemaAdapter.resourceToDto(model);
      response = {
        status: DataStatus.Ok,
        data: result
      };
    } catch (error) {
      response = this.processServiceError(error);
    }
    return response;
  }
  //#endregion

  //#region Post routes callbacks ---------------------------------------------
  private async saveTimeEntry(routedRequest: RoutedRequest<DtoTimeEntryForm>): Promise<DtoDataResponse<DtoTimeEntry>> {
    let response: DtoDataResponse<DtoTimeEntry>;
    const form = routedRequest.data;
    try {
      if (form.commit) {
        form.payload['customField2'] = form.payload.start;
        form.payload['customField3'] = form.payload.end;
        form.payload['customField5'] = form.payload.billed;
        const data = (form.payload as unknown) as Record<string, unknown>;
        let saveResponse: TimeEntryEntityModel;
        if (form.commitMethod === 'post') {
          saveResponse = await this.openprojectService.post(form.commit, data, TimeEntryEntityModel);
        } else {
          saveResponse = await this.openprojectService.patch(form.commit, data, TimeEntryEntityModel);
        }
        const result = await this.timeEntryEntityAdapter.resourceToDto(saveResponse);
        response = {
          status: DataStatus.Ok,
          data: result
        }
      } else {
        response = {
          status: DataStatus.Error,
          message: 'Data has not been validated'
        }
      }
    } catch (error) {
      return this.processServiceError(error);
    }
    return response;
  }

  private async setTimeEntryBilled(routedRequest: RoutedRequest<Array<number>>): Promise<DtoDataResponse<Array<DtoTimeEntry>>> {
    return this.setTimeEntryBilledValue(routedRequest, true);
  }

  private async setTimeEntryNonBilled(routedRequest: RoutedRequest<Array<number>>): Promise<DtoDataResponse<Array<DtoTimeEntry>>> {
    return this.setTimeEntryBilledValue(routedRequest, false);
  }
  //#endregion

  //#region Private helper methods --------------------------------------------
  private async getTimeEntriesByUri(all: boolean, filter: DtoBaseFilter): Promise<DtoTimeEntryList> {

    const collection = await this.getCollectionModelByUnfilteredUri(all, this.entityRoot, TimeEntryCollectionModel, true, filter);

    await Promise.all([
      this.preFetchLinks(collection.elements, (m: TimeEntryEntityModel) => m.workPackage),
      this.preFetchLinks(collection.elements, (m: TimeEntryEntityModel) => m.activity),
      this.preFetchLinks(collection.elements, (m: TimeEntryEntityModel) => m.project),
      this.preFetchLinks(collection.elements, (m: TimeEntryEntityModel) => m.user)
    ]);

    return this.timeEntryCollectionAdapter.resourceToDto(this.timeEntryEntityAdapter, collection);
  }

  private async setTimeEntryBilledValue(routedRequest: RoutedRequest<Array<number>>, billed: boolean): Promise<DtoDataResponse<Array<DtoTimeEntry>>> {
    let response: DtoDataResponse<Array<DtoTimeEntry>>;
    try {
      const saveResponses = routedRequest.data.map(async entry => {
        const data = { customField5: billed }
        const saveResponse = await this.openprojectService.patch(`${this.entityRoot}/${entry}`, data, TimeEntryEntityModel);
        return await this.timeEntryEntityAdapter.resourceToDto(saveResponse);
      });
      response = {
        status: DataStatus.Ok,
        data: await Promise.all(saveResponses)
      }
    } catch (error) {
      return this.processServiceError(error);
    }
    return response;

  }
  //#endregion
}
