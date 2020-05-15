import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { IProjectAdapter, IProjectListAdapter } from '@adapters';
import { IDataRouterService, RoutedRequest } from '@data';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse } from '@ipc';
import { DtoCategory, DtoProjectList, DtoProject } from '@ipc';

import { IDataService } from '../data-service';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';

export interface IProjectsService extends IDataService { }

@injectable()
export class ProjectsService implements IProjectsService {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) private logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) private openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.ProjectAdapter) private projectAdapter: IProjectAdapter,
    @inject(ADAPTERTYPES.ProjectListAdapter) private projectListAdapter: IProjectListAdapter) { }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/projects', this.getProjects.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private getProjects(request: RoutedRequest): Promise<DtoDataResponse<DtoProjectList>> {
    return this.openprojectService.fetchResource('/projects').then(
      halResource => {
        const halProjects = halResource.prop('elements');
        const promises = halProjects.map(halProject => halProject.links['categories'].fetch());
        return Promise.all(promises).then( () => {
          const result = this.projectListAdapter.adapt(this.projectAdapter, halResource);
          const response: DtoDataResponse<DtoProjectList> = {
            status: DataStatus.Ok,
            data: result
          };
          return response;
        });
      },
      err => {
        const response: DtoDataResponse<DtoProjectList> = {
          status: DataStatus.Error,
          message: `${err.name}: ${err.message}`
        };
        return response;
      }
    );
  }
  // </editor-fold>
}
