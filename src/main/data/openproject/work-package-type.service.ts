import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IDataService } from '../data-service';
import { BaseDataService } from '../base-data-service';
import { ILogService, IOpenprojectService } from '@core';
import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';
import { IWorkPackageTypeEntityAdapter, IWorkPackageTypeCollectionAdapter } from '@adapters';
import { IDataRouterService } from '../data-router.service';
import { DtoWorkPackageTypeList, DtoDataResponse, DataStatus } from '@ipc';
import { RoutedRequest } from '@data/routed-request';
import { WorkPackageTypeCollectionModel } from '@core/hal-models';

export interface IWorkPackageTypeService extends IDataService { }

@injectable()
export class WorkPackageTypeService extends BaseDataService implements IWorkPackageTypeService {

  // <editor-fold desc='Private properties'>
  private workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter;
  private workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter;
  // </editor-fold>

  // <editor-fold desc='Protected abstract getters implementation'>
  protected get entityRoot(): string { return '/types'; };
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.WorkPackageTypeCollectionAdapter) workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageTypeEntityAdapter)  workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter) {
    super(logService, openprojectService);
    this.workPackageTypeCollectionAdapter = workPackageTypeCollectionAdapter;
    this.workPackageTypeEntityAdapter = workPackageTypeEntityAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/work-package-types', this.getWorkPackageTypes.bind(this));
  }
  // </editor-fold>

  private async getWorkPackageTypes(request: RoutedRequest): Promise<DtoDataResponse<DtoWorkPackageTypeList>> {
    let response: DtoDataResponse<DtoWorkPackageTypeList>;
    const uri = this.buildUriWithFilter(this.entityRoot, request.data);
    try {
      const collection = await this.openprojectService.fetch(uri, WorkPackageTypeCollectionModel);
      const result = await this.workPackageTypeCollectionAdapter.resourceToDto(this.workPackageTypeEntityAdapter, collection);
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

}
