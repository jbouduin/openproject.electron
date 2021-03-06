import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IDataService } from '../data-service';
import { BaseDataService } from '../base-data-service';
import { ILogService, IOpenprojectService } from '@core';
import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';
import { IWorkPackageEntityAdapter, IWorkPackageCollectionAdapter } from '@adapters';
import { IDataRouterService } from '../data-router.service';
import { DtoWorkPackageList, DtoDataResponse, DataStatus } from '@ipc';
import { RoutedRequest } from '@data/routed-request';
import { WorkPackageCollectionModel, ProjectEntityModel, WorkPackageEntityModel, WorkPackageTypeEntityModel } from '@core/hal-models';

export interface IWorkPackagesService extends IDataService { }

@injectable()
export class WorkPackagesService extends BaseDataService implements IWorkPackagesService {

  // <editor-fold desc='Private properties'>
  private workPackageEntityAdapter: IWorkPackageEntityAdapter;
  private workPackageCollectionAdapter: IWorkPackageCollectionAdapter;
  // </editor-fold>

  // <editor-fold desc='Protected abstract getters implementation'>
  protected get entityRoot(): string { return '/work_packages'; };
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.WorkPackageCollectionAdapter) workPackageCollectionAdapter: IWorkPackageCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageEntityAdapter)  workPackageEntityAdapter: IWorkPackageEntityAdapter) {
    super(logService, openprojectService);
    this.workPackageCollectionAdapter = workPackageCollectionAdapter;
    this.workPackageEntityAdapter = workPackageEntityAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/work-packages', this.getWorkPackages.bind(this));
  }
  // </editor-fold>

  private async getWorkPackages(request: RoutedRequest): Promise<DtoDataResponse<DtoWorkPackageList>> {
    let response: DtoDataResponse<DtoWorkPackageList>;
    const uri = this.buildUriWithFilter(this.entityRoot, request.data);
    try {
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
