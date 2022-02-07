import { HalResource } from '@jbouduin/hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ICategoryCollectionAdapter, ICategoryEntityAdapter } from '@adapters';
import { IProjectCollectionAdapter, IProjectEntityAdapter } from '@adapters';
import { IWorkPackageTypeCollectionAdapter, IWorkPackageTypeEntityAdapter } from '@adapters';
import { CategoryCollectionModel, ProjectCollectionModel, ProjectEntityModel, WorkPackageTypeCollectionModel } from '@core/hal-models';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoBaseFilter, DtoDataResponse, DtoProject, DtoProjectList } from '@ipc';
import { BaseDataService } from '../base-data-service';
import { IRoutedDataService } from '../routed-data-service';
import { IDataRouterService } from '../data-router.service';
import { RoutedRequest } from '../routed-request';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';
import { noop } from 'lodash';

export type ProjectLinkTypes = 'types' | 'categories';

export interface IProjectsService {
  getProjectDetails(projectId: number, deeplink?: Array<ProjectLinkTypes>): Promise<DtoProject>;
  getProjects(): Promise<DtoProjectList>;
}

// TODO this should not be a basedataservice descendant.
// In order to solve this, builduri and the other methods should go into a decorator class
// same ofr work package status service
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
  protected get entityRoot(): string { return '/projects'; };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.CategoryCollectionAdapter) categoryCollectionAdapter: ICategoryCollectionAdapter,
    @inject(ADAPTERTYPES.CategoryEntityAdapter) categoryEntityAdapter: ICategoryEntityAdapter,
    @inject(ADAPTERTYPES.ProjectCollectionAdapter) projectCollectionAdapter: IProjectCollectionAdapter,
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectEntityAdapter: IProjectEntityAdapter,
    @inject(ADAPTERTYPES.WorkPackageCollectionAdapter) workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter,
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
    noop;
  }
  //#endregion

  //#region IProjectsService interface method ---------------------------------
  public async getProjectDetails(projectId: number, deeplinks?: Array<ProjectLinkTypes>): Promise<DtoProject> {
    const project = await this.openprojectService.fetch(`${this.entityRoot}/${projectId}`, ProjectEntityModel);
    const dtoProject = await this.projectEntityAdapter.resourceToDto(project);

    if (deeplinks) {
      if (deeplinks.indexOf('types') >= 0) {
        const typeCollection = await this.deepLink(WorkPackageTypeCollectionModel, (project.link('types') as HalResource).uri);
        dtoProject.workPackageTypes = await this.workPackageTypeCollectionAdapter.resourceToDto(this.workPackageTypeEntityAdapter, typeCollection);

      }
      if (deeplinks.indexOf('categories') >= 0) {
        const categorCollection = await (project.link('categories') as HalResource).fetch() as CategoryCollectionModel;
        dtoProject.categories = await this.categoryCollectionAdapter.resourceToDto(this.categoryEntityAdapter, categorCollection);
      }
    }
    return dtoProject;
  }
  //#endregion

  //#region GET routes callback -----------------------------------------------
  public async getProjects(): Promise<DtoProjectList> {
    const filter: DtoBaseFilter = {
      offset: 0,
      pageSize: 500
    };
    const uri = this.buildUriWithFilter(this.entityRoot, filter);

    return this.openprojectService.fetch(uri, ProjectCollectionModel)
      .then((collection: ProjectCollectionModel) => this
        .preFetchLinks(
          collection.elements,
          (m: ProjectEntityModel) => m.parent)
        .then(() => this.projectCollectionAdapter.resourceToDto(this.projectEntityAdapter, collection)));
  }
  //#endregion
}
