import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IRoutedDataService } from '../routed-data-service';
import { BaseDataService } from '../base-data-service';
import { ILogService, IOpenprojectService } from '@core';
import { IWorkPackageEntityAdapter, IWorkPackageCollectionAdapter } from '@adapters';
import { IDataRouterService, RouteCallback } from '../data-router.service';
import { DtoWorkPackageList, DtoDataResponse, DataStatus, DtoBaseFilter } from '@common';
import { RoutedRequest } from '@data/routed-request';
import { WorkPackageCollectionModel, WorkPackageEntityModel } from '@core/hal-models';
import { WorkPackageTypeMap } from '@common';
import { IWorkPackageTypeService } from './work-package-type.service';

import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';

export interface IWorkPackagesService extends IRoutedDataService {
  getInvoicesForProject(projectId: number): Promise<DtoWorkPackageList>;
}

@injectable()
export class WorkPackagesService extends BaseDataService implements IWorkPackagesService {

  //#region Private properties ------------------------------------------------
  private workPackageEntityAdapter: IWorkPackageEntityAdapter;
  private workPackageCollectionAdapter: IWorkPackageCollectionAdapter;
  private workPackTypeService: IWorkPackageTypeService;
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/work_packages'; }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(SERVICETYPES.WorkPackageTypeService) workPackTypeService: IWorkPackageTypeService,
    @inject(ADAPTERTYPES.WorkPackageCollectionAdapter) workPackageCollectionAdapter: IWorkPackageCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageEntityAdapter) workPackageEntityAdapter: IWorkPackageEntityAdapter) {
    super(logService, openprojectService);
    this.workPackTypeService = workPackTypeService;
    this.workPackageCollectionAdapter = workPackageCollectionAdapter;
    this.workPackageEntityAdapter = workPackageEntityAdapter;
  }
  //#endregion

  //#region IBaseDataService Interface methods --------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.get('/work-packages', this.getWorkPackages.bind(this) as RouteCallback);
  }
  //#endregion

  //#region IWorkPackageService members ---------------------------------------
  public async getInvoicesForProject(projectId: number): Promise<DtoWorkPackageList> {
    const invoiceType = await this.workPackTypeService.getWorkPackageTypeByName(WorkPackageTypeMap.Invoice);
    const filters = new Array<any>();
    filters.push({
      'type': {
        'operator': '=',
        'values': [
          invoiceType.id
        ]
      }
    });
    filters.push({
      'project': {
        'operator': '=',
        'values': [
          projectId
        ]
      }
    });

    const filter: DtoBaseFilter = {
      offset: 0,
      pageSize: 100,
      filters: JSON.stringify(filters)
    };

    return this.getWorkPackagesByUri(true, filter);
  }
  //#endregion

  //#region GET route callback ------------------------------------------------
  private async getWorkPackages(request: RoutedRequest<DtoBaseFilter>): Promise<DtoDataResponse<DtoWorkPackageList>> {
    let response: DtoDataResponse<DtoWorkPackageList>;
    try {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const collection = await this.getWorkPackagesByUri(false, request.data);
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
  private async getWorkPackagesByUri(all: boolean, filter: DtoBaseFilter): Promise<DtoWorkPackageList> {
    const collection = await this.getCollectionModelByUnfilteredUri(all, this.entityRoot, WorkPackageCollectionModel, true, filter);
    await Promise.all([
      this.preFetchLinks(collection.elements, (m: WorkPackageEntityModel) => m.project),
      this.preFetchLinks(collection.elements, (m: WorkPackageEntityModel) => m.type),
      this.preFetchLinks(collection.elements, (m: WorkPackageEntityModel) => m.parent)
    ]);
    return await this.workPackageCollectionAdapter.resourceToDto(this.workPackageEntityAdapter, collection);

  }
  //#endregion
}
