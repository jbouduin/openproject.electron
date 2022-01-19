import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IProjectCollectionAdapter, IProjectEntityAdapter } from '@adapters';
import { ProjectCollectionModel, ProjectEntityModel } from '@core/hal-models';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoBaseFilter, DtoDataResponse, DtoProject, DtoProjectList } from '@ipc';
import { BaseDataService } from '../base-data-service';
import { IDataService } from '../data-service';
import { IDataRouterService } from '../data-router.service';
import { RoutedRequest } from '../routed-request';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';

export interface IProjectsService extends IDataService {
  getProject(projectId: number): Promise<DtoProject>;
}

@injectable()
export class ProjectsService extends BaseDataService implements IProjectsService {

  //#region Private properties ------------------------------------------------
  private projectEntityAdapter: IProjectEntityAdapter;
  private projectCollectionAdapter: IProjectCollectionAdapter;
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/projects'; };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.ProjectCollectionAdapter) projectCollectionAdapter: IProjectCollectionAdapter,
    @inject(ADAPTERTYPES.ProjectEntityAdapter)  projectEntityAdapter: IProjectEntityAdapter) {
    super(logService, openprojectService);
    this.projectCollectionAdapter = projectCollectionAdapter;
    this.projectEntityAdapter = projectEntityAdapter;
  }
  //#endregion

  //#region IBaseDataService Interface methods --------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.get(this.entityRoot, this.getProjects.bind(this));
  }
  //#endregion

  //#region IProjectsService interface method ---------------------------------
  public async getProject(projectId: number): Promise<DtoProject> {
    const project = await this.openprojectService.fetch(`${this.entityRoot}/${projectId}`, ProjectEntityModel);
    const result = await this.projectEntityAdapter.resourceToDto(project);
    return result;
  }
  //#endregion

  //#region GET routes callback -----------------------------------------------
  private async getProjects(_request: RoutedRequest): Promise<DtoDataResponse<DtoProjectList>> {
    let response: DtoDataResponse<DtoProjectList>;
    try {
      const filter: DtoBaseFilter = {
        offset: 0,
        pageSize: 500
      };
      const uri = this.buildUriWithFilter(this.entityRoot, filter);
      const collection = await this.openprojectService.fetch(uri, ProjectCollectionModel);
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
  //#endregion
}
