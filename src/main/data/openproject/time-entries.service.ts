import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ITimeEntryCollectionAdapter, ITimeEntryEntityAdapter, ITimeEntryFormAdapter, ISchemaAdapter } from '@adapters';
import { ILogService, IOpenprojectService } from '@core';
import { TimeEntryCollectionModel, TimeEntryFormModel, TimeEntryEntityModel, SchemaModel, WorkPackageEntityModel, ProjectEntityModel, UserEntityModel, TimeEntryActivityEntityModel } from '@core/hal-models';
import { DataStatus, DtoDataResponse, DtoTimeEntryList, DtoBaseForm, DtoTimeEntry, DtoTimeEntryForm, DtoSchema } from '@ipc';
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
  private schemaAdapter: ISchemaAdapter;
  private timeEntryCollectionAdapter: ITimeEntryCollectionAdapter;
  private timeEntryEntityAdapter: ITimeEntryEntityAdapter;
  private timeEntryformAdapter: ITimeEntryFormAdapter;
  // </editor-fold>

  // <editor-fold desc='Protected abstract getters implementation'>
  protected get entityRoot(): string { return '/time_entries'; };
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
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
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.delete('/time-entries/:id', this.deleteEntry.bind(this));
    router.get('/time-entries', this.getTimeEntries.bind(this));
    router.get('/time-entries/form', this.timeEntryForm.bind(this));
    router.get('/time-entries/:id/form', this.timeEntryForm.bind(this));
    router.get('/time-entries/schema', this.timeEntrySchema.bind(this));
    router.post('/time-entries/form', this.saveTimeEntry.bind(this));
    router.post('/time-entries/set-billed', this.setTimeEntryBilled.bind(this));
    router.post('/time-entries/set-non-billed', this.setTimeEntryNonBilled.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='Delete routes callback'>
  private async deleteEntry(request: RoutedRequest): Promise<DtoDataResponse<any>> {
    let response: DtoDataResponse<any>;
    try {
      const uri = `${this.entityRoot}/${request.params.id}`;
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
  // </editor-fold>

  // <editor-fold desc='Get routes callback'>
  private async getTimeEntries(request: RoutedRequest): Promise<DtoDataResponse<DtoTimeEntryList>> {
    let response: DtoDataResponse<DtoTimeEntryList>;
    const uri = this.buildUriWithFilter(this.entityRoot, request.data);
    try {
      const collection = await this.openprojectService.fetch(uri, TimeEntryCollectionModel);
      await this.preFetchLinks(
        collection.elements,
        WorkPackageEntityModel,
        (m: TimeEntryEntityModel) => m.workPackage,
        (m: TimeEntryEntityModel, l: WorkPackageEntityModel) => m.workPackage = l);

      await this.preFetchLinks(
        collection.elements,
        TimeEntryActivityEntityModel,
        (m: TimeEntryEntityModel) => m.activity,
        (m: TimeEntryEntityModel, l: TimeEntryActivityEntityModel) => m.activity = l);

      await this.preFetchLinks(
        collection.elements,
        ProjectEntityModel,
        (m: TimeEntryEntityModel) => m.project,
        (m: TimeEntryEntityModel, l: ProjectEntityModel) => m.project = l);

      await this.preFetchLinks(
        collection.elements,
        UserEntityModel,
        (m: TimeEntryEntityModel) => m.user,
        (m: TimeEntryEntityModel, l: UserEntityModel) => m.user = l);

      const result = await this.timeEntryCollectionAdapter.resourceToDto(this.timeEntryEntityAdapter, collection);
      response = {
        status: DataStatus.Ok,
        data: result
      };
    }
    catch (err) {
      console.log(err);
      response = this.processServiceError(err);
    }
    return response;
  }

  private async timeEntryForm(routedRequest: RoutedRequest): Promise<DtoDataResponse<DtoBaseForm<DtoTimeEntry>>> {
    let response: DtoDataResponse<DtoBaseForm<DtoTimeEntry>>;
    let uri: string;
    let data: Object;

    if (routedRequest.data) {
      data = (routedRequest.data as DtoTimeEntryForm).payload;
      uri = (routedRequest.data as DtoTimeEntryForm).validate;
    } else {
      if (routedRequest.params.id) {
        uri = `${this.entityRoot}/${routedRequest.params.id}/form`;
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
        form
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

  private async timeEntrySchema(_routedRequest: RoutedRequest): Promise<DtoDataResponse<DtoSchema>> {
    let response: DtoDataResponse<DtoSchema>;
    try {
      const model = await this.openprojectService.fetch(`${this.entityRoot}/schema`, SchemaModel);
      const result = this.schemaAdapter.resourceToDto(model);
      response =  {
        status: DataStatus.Ok,
        data: result
      };
    } catch (error) {
      response = this.processServiceError(error);
    }
    return response;
  }
  // </editor-fold>

  // <editor-fold desc='Post routes callback'>
  private async saveTimeEntry(routedRequest: RoutedRequest): Promise<DtoDataResponse<DtoTimeEntry>> {
    let response: DtoDataResponse<DtoTimeEntry>;
    const form = routedRequest.data as DtoTimeEntryForm;
    try {
      if (form.commit) {
        let saveResponse: TimeEntryEntityModel;
        if (form.commitMethod === 'post') {
          saveResponse = await this.openprojectService.post(form.commit, form.payload, TimeEntryEntityModel);
        } else {
          saveResponse = await this.openprojectService.patch(form.commit, form.payload, TimeEntryEntityModel);
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

  private async setTimeEntryBilled(routedRequest: RoutedRequest): Promise<DtoDataResponse<Array<DtoTimeEntry>>> {
    return this.setTimeEntryBilledValue(routedRequest, true);
  }

  private async setTimeEntryNonBilled(routedRequest: RoutedRequest): Promise<DtoDataResponse<Array<DtoTimeEntry>>> {
    return this.setTimeEntryBilledValue(routedRequest, false);
  }

  private async setTimeEntryBilledValue(routedRequest: RoutedRequest, billed: boolean): Promise<DtoDataResponse<Array<DtoTimeEntry>>> {
    let response: DtoDataResponse<Array<DtoTimeEntry>>;
    const timeEntries = routedRequest.data as Array<number>;
    try {
      const saveResponses = timeEntries.map(async entry => {
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
  // </editor-fold>
}
