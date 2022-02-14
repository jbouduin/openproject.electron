import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ILogService, IOpenprojectService } from '@core';
import { IWorkPackageTypeEntityAdapter, IWorkPackageTypeCollectionAdapter } from '@adapters';
import { WorkPackageTypeCollectionModel } from '@core/hal-models';
import { BaseDataService } from '@data/base-data-service';
import { IDataRouterService } from '@data/data-router.service';
import { IRoutedDataService } from '@data/routed-data-service';
import { DataStatus, DtoBaseFilter, DtoDataResponse, DtoWorkPackageType, DtoWorkPackageTypeList } from '@ipc';

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
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.get('/work-package-types', this.getWorkPackageTypes.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region IWorkPackageTypeService methods -----------------------------------
  public async getWorkPackageTypeByName(name: string): Promise<DtoWorkPackageType> {
    const filters = new Array<unknown>();
    filters.push({
      'name': {
        'operator': '=',
        'values': [name]
      }
    });
    const filter: DtoBaseFilter = {
      pageSize: 0,
      offset: 0,
      filters: JSON.stringify(filters),
      groupby: 'status'
    }

    const uri = this.buildUriWithFilter(this.entityRoot, filter);
    return this.openprojectService
      .fetch(uri, WorkPackageTypeCollectionModel)
      .then((collection: WorkPackageTypeCollectionModel) =>
        this.workPackageTypeEntityAdapter.resourceToDto(collection.elements[0])
      );
  }

  public async loadWorkPackageTypes(): Promise<DtoWorkPackageTypeList> {
    return this.openprojectService.createResource(WorkPackageTypeCollectionModel, this.entityRoot, false)
      .fetch()
      .then((collection: WorkPackageTypeCollectionModel) =>
        this.workPackageTypeCollectionAdapter.resourceToDto(this.workPackageTypeEntityAdapter, collection)
      );
  }
  //#endregion

  //#region GET method callback -----------------------------------------------
  public async getWorkPackageTypes(): Promise<DtoDataResponse<DtoWorkPackageTypeList>> {
    const list = await this.loadWorkPackageTypes();
    const result: DtoDataResponse<DtoWorkPackageTypeList> = {
      status:DataStatus.Ok,
      data: list
    }
    return result;
  }


  //#endregion

}
