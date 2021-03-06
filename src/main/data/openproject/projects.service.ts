import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IProjectCollectionAdapter, IProjectEntityAdapter } from '@adapters';
import { ProjectCollectionModel, ProjectEntityModel } from '@core/hal-models';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse, DtoProjectList } from '@ipc';
import { BaseDataService } from '../base-data-service';
import { IDataService } from '../data-service';
import { IDataRouterService } from '../data-router.service';
import { RoutedRequest } from '../routed-request';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';

export interface IProjectsService extends IDataService { }

@injectable()
export class ProjectsService extends BaseDataService implements IProjectsService {

  // <editor-fold desc='Private properties'>
  private projectEntityAdapter: IProjectEntityAdapter;
  private projectCollectionAdapter: IProjectCollectionAdapter;
  // </editor-fold>

  // <editor-fold desc='Protected abstract getters implementation'>
  protected get entityRoot(): string { return '/projects'; };
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.ProjectCollectionAdapter) projectCollectionAdapter: IProjectCollectionAdapter,
    @inject(ADAPTERTYPES.ProjectEntityAdapter)  projectEntityAdapter: IProjectEntityAdapter) {
    super(logService, openprojectService);
    this.projectCollectionAdapter = projectCollectionAdapter;
    this.projectEntityAdapter = projectEntityAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get(this.entityRoot, this.getProjects.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private async getProjects(_request: RoutedRequest): Promise<DtoDataResponse<DtoProjectList>> {
    let response: DtoDataResponse<DtoProjectList>;
    try {
      const collection = await this.openprojectService.fetch(this.entityRoot, ProjectCollectionModel);
      await this.preFetchLinks(
        collection.elements,
        ProjectEntityModel,
        (m: ProjectEntityModel) => m.parent,
        (m: ProjectEntityModel, l: ProjectEntityModel) => m.parent = l);
      const result = await this.projectCollectionAdapter.resourceToDto(this.projectEntityAdapter, collection);
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
  // </editor-fold>
}
