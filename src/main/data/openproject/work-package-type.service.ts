import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ILogService, IOpenprojectService } from '@core';
import { IWorkPackageTypeEntityAdapter, IWorkPackageTypeCollectionAdapter } from '@adapters';
import { WorkPackageTypeCollectionModel } from '@core/hal-models';
import { BaseDataService } from '@data/base-data-service';
import { IDataRouterService, RouteCallback } from '@data/data-router.service';
import { IRoutedDataService } from '@data/routed-data-service';
import { DataStatus, DtoDataResponse, DtoWorkPackageType, DtoWorkPackageTypeList } from '@common';

import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';

export interface IWorkPackageTypeService extends IRoutedDataService {
  loadWorkPackageTypes(): Promise<DtoWorkPackageTypeList>;
  getWorkPackageTypeByName(name: string): Promise<DtoWorkPackageType>;
}

@injectable()
export class WorkPackageTypeService extends BaseDataService implements IWorkPackageTypeService {

  //#region private properties ------------------------------------------------
  private workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter;
  private workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter;
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/types'; }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.WorkPackageTypeCollectionAdapter) workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageTypeEntityAdapter) workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter) {
    super(logService, openprojectService);
    this.workPackageTypeCollectionAdapter = workPackageTypeCollectionAdapter;
    this.workPackageTypeEntityAdapter = workPackageTypeEntityAdapter;
  }
  //#endregion

  //#region IBaseDataService Interface methods --------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.get('/work-package-types', this.getWorkPackageTypes.bind(this) as RouteCallback);
  }
  //#endregion

  //#region IWorkPackageTypeService methods -----------------------------------
  public async getWorkPackageTypeByName(name: string): Promise<DtoWorkPackageType> {
    // apparently the openproject API is not capable of filtering by name
    // so we have to retrieve everything (not a big deal as this is cached)
    const all = await this.loadWorkPackageTypes();
    return all.items.find((workPackageType: DtoWorkPackageType) => workPackageType.name === name);
  }

  public async loadWorkPackageTypes(): Promise<DtoWorkPackageTypeList> {
    return this.getCollectionModelByUnfilteredUri(true, this.entityRoot, WorkPackageTypeCollectionModel, false)
      .then((collection: WorkPackageTypeCollectionModel) =>
        this.workPackageTypeCollectionAdapter.resourceToDto(this.workPackageTypeEntityAdapter, collection)
      );
  }
  //#endregion

  //#region GET method callback -----------------------------------------------
  public async getWorkPackageTypes(): Promise<DtoDataResponse<DtoWorkPackageTypeList>> {
    const list = await this.loadWorkPackageTypes();
    const result: DtoDataResponse<DtoWorkPackageTypeList> = {
      status: DataStatus.Ok,
      data: list
    }
    return result;
  }
  //#endregion

}
