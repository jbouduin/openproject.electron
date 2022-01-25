import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IRoutedDataService } from '../routed-data-service';
import { BaseDataService } from '../base-data-service';
import { ILogService, IOpenprojectService } from '@core';
import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';
import { IWorkPackageEntityAdapter, IWorkPackageCollectionAdapter } from '@adapters';
import { IDataRouterService } from '../data-router.service';
import { DtoWorkPackageList, DtoDataResponse, DataStatus, DtoBaseFilter } from '@ipc';
import { RoutedRequest } from '@data/routed-request';
import { WorkPackageCollectionModel, ProjectEntityModel, WorkPackageEntityModel, WorkPackageTypeEntityModel } from '@core/hal-models';
import { WorkPackageTypeMap } from '@core/hal-models/work-package-type-map';

export interface IWorkPackagesService extends IRoutedDataService {
  getInvoicesForProject(projectId: number): Promise<DtoWorkPackageList>;
}

@injectable()
export class WorkPackagesService extends BaseDataService implements IWorkPackagesService {

  //#region Private properties ------------------------------------------------
  private workPackageEntityAdapter: IWorkPackageEntityAdapter;
  private workPackageCollectionAdapter: IWorkPackageCollectionAdapter;
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/work_packages'; };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.WorkPackageCollectionAdapter) workPackageCollectionAdapter: IWorkPackageCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageEntityAdapter) workPackageEntityAdapter: IWorkPackageEntityAdapter) {
    super(logService, openprojectService);
    this.workPackageCollectionAdapter = workPackageCollectionAdapter;
    this.workPackageEntityAdapter = workPackageEntityAdapter;
  }
  //#endregion

  //#region IBaseDataService Interface methods --------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.get('/work-packages', this.getWorkPackages.bind(this));
  }
  //#endregion

  //#region IWorkPackageService members ---------------------------------------
  public getInvoicesForProject(projectId: number): Promise<DtoWorkPackageList> {
    const filters = new Array<any>();
    filters.push({
      'type': {
        'operator': '=',
        'values': [
          WorkPackageTypeMap.Invoice
        ]
      }
    });
    filters.push({
      'project': {
        'operator': '=',
        'values': [
          `${projectId}`
        ]
      }
    });
    const requestData: DtoBaseFilter = {
      offset: 0,
      pageSize: 100,
      filters: JSON.stringify(filters)
    };
    const uri = this.buildUriWithFilter(this.entityRoot, requestData);
    return this.getWorkPackagesByUri(uri);
  }
  //#endregion

  //#region GET route callback ------------------------------------------------
  private async getWorkPackages(request: RoutedRequest): Promise<DtoDataResponse<DtoWorkPackageList>> {
    let response: DtoDataResponse<DtoWorkPackageList>;
    const uri = this.buildUriWithFilter(this.entityRoot, request.data);
    try {
      const collection = await this.getWorkPackagesByUri(uri);
      response = {
        status: DataStatus.Ok,
        data: collection
      };
    }
    catch (err) {
      response = this.processServiceError(err);
    }
    return response;
  }
  //#endregion

  //#region private helper methods --------------------------------------------
  private async getWorkPackagesByUri(uri: string): Promise<DtoWorkPackageList> {
    const collection = await this.openprojectService.fetch(uri, WorkPackageCollectionModel);
    await this.preFetchLinks(
      collection.elements,
      ProjectEntityModel,
      (m: WorkPackageEntityModel) => m.project,
      (m: WorkPackageEntityModel, l: ProjectEntityModel) => m.project = l);
    await this.preFetchLinks(
      collection.elements,
      WorkPackageTypeEntityModel,
      (m: WorkPackageEntityModel) => m.type,
      (m: WorkPackageEntityModel, l: WorkPackageTypeEntityModel) => m.type = l);
    await this.preFetchLinks(
      collection.elements,
      WorkPackageEntityModel,
      (m: WorkPackageEntityModel) => m.parent,
      (m: WorkPackageEntityModel, l: WorkPackageEntityModel) => m.parent = l);
    const result = await this.workPackageCollectionAdapter.resourceToDto(this.workPackageEntityAdapter, collection);
    return result;
  }
  //#endregion
}
