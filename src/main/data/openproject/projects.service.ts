import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { ICategoryCollectionAdapter, ICategoryEntityAdapter } from '@adapters';
import { IProjectCollectionAdapter, IProjectEntityAdapter } from '@adapters';
import { IWorkPackageTypeCollectionAdapter, IWorkPackageTypeEntityAdapter } from '@adapters';
import { ProjectCollectionModel, ProjectEntityModel } from '@core/hal-models';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse, DtoProject, DtoProjectList } from '@common';
import { BaseDataService } from '../base-data-service';
import { IDataRouterService } from '../data-router.service';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';
import { IRoutedDataService } from '@data/routed-data-service';

export type ProjectLinkTypes = 'types' | 'categories';

export interface IProjectsService extends IRoutedDataService {
  getProjectDetails(projectId: number, deeplink?: Array<ProjectLinkTypes>): Promise<DtoProject>;
  loadProjects(): Promise<DtoProjectList>;
}

@injectable()
export class ProjectsService extends BaseDataService implements IProjectsService {

  //#region Private properties ------------------------------------------------
  private categoryCollectionAdapter: ICategoryCollectionAdapter;
  private categoryEntityAdapter: ICategoryEntityAdapter;
  private projectCollectionAdapter: IProjectCollectionAdapter;
  private projectEntityAdapter: IProjectEntityAdapter;
  private workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter;
  private workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter;
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/projects'; }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.CategoryCollectionAdapter) categoryCollectionAdapter: ICategoryCollectionAdapter,
    @inject(ADAPTERTYPES.CategoryEntityAdapter) categoryEntityAdapter: ICategoryEntityAdapter,
    @inject(ADAPTERTYPES.ProjectCollectionAdapter) projectCollectionAdapter: IProjectCollectionAdapter,
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectEntityAdapter: IProjectEntityAdapter,
    @inject(ADAPTERTYPES.WorkPackageTypeCollectionAdapter) workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageTypeEntityAdapter) workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter) {
    super(logService, openprojectService);
    this.categoryCollectionAdapter = categoryCollectionAdapter;
    this.categoryEntityAdapter = categoryEntityAdapter;
    this.projectCollectionAdapter = projectCollectionAdapter;
    this.projectEntityAdapter = projectEntityAdapter;
    this.workPackageTypeCollectionAdapter = workPackageTypeCollectionAdapter;
    this.workPackageTypeEntityAdapter = workPackageTypeEntityAdapter;
  }
  //#endregion

  //#region IBaseDataService Interface methods --------------------------------
  public setRoutes(router: IDataRouterService): void {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.get('/projects', this.getProjects.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region IProjectsService interface method ---------------------------------
  public async getProjectDetails(projectId: number, deeplinks?: Array<ProjectLinkTypes>): Promise<DtoProject> {
    const project = await this.openprojectService.fetch(`${this.entityRoot}/${projectId}`, ProjectEntityModel);
    const dtoProject = await this.projectEntityAdapter.resourceToDto(project);

    if (deeplinks) {
      if (deeplinks.indexOf('types') >= 0) {
        const typeCollection = await project.types.fetch();
        dtoProject.workPackageTypes = await this.workPackageTypeCollectionAdapter.resourceToDto(this.workPackageTypeEntityAdapter, typeCollection);
      }
      if (deeplinks.indexOf('categories') >= 0) {
        const categoryCollection = await project.categories.fetch();
        dtoProject.categories = await this.categoryCollectionAdapter.resourceToDto(this.categoryEntityAdapter, categoryCollection);
      }
    }
    return dtoProject;
  }

  public async loadProjects(): Promise<DtoProjectList> {
    return this
      .getCollectionModelByUnfilteredUri(
        true,
        this.entityRoot,
        ProjectCollectionModel,
        false
      )
      .then((collection: ProjectCollectionModel) => this.projectCollectionAdapter.resourceToDto(this.projectEntityAdapter, collection));
  }
  //#endregion

  //#region GET routes callback -----------------------------------------------
  private async getProjects(): Promise<DtoDataResponse<DtoProjectList>> {
    const list = await this.loadProjects();
    const result: DtoDataResponse<DtoProjectList> = {
      status: DataStatus.Ok,
      data: list
    };
    return result;
  }
  //#endregion
}
