import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { IProjectAdapter, IProjectListAdapter } from '@adapters';
import { IDataRouterService, RoutedRequest } from '@data';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse } from '@ipc';
import { DtoProjectList } from '@ipc';

import { IDataService } from '../data-service';

import ADAPTERTYPES from '../../adapters/adapter.types';
import SERVICETYPES from '../../@core/service.types';
import { BaseDataService } from '@data/base-data-service';

export interface IProjectsService extends IDataService { }

@injectable()
export class ProjectsService extends BaseDataService implements IProjectsService {

  // <editor-fold desc='Private properties'>
  private projectAdapter: IProjectAdapter;
  private projectListAdapter: IProjectListAdapter;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.ProjectAdapter) projectAdapter: IProjectAdapter,
    @inject(ADAPTERTYPES.ProjectListAdapter) projectListAdapter: IProjectListAdapter) {
    super(logService, openprojectService);
    this.projectAdapter = projectAdapter;
    this.projectListAdapter = projectListAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/projects', this.getProjects.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private async getProjects(_request: RoutedRequest): Promise<DtoDataResponse<DtoProjectList>> {
    let response: DtoDataResponse<DtoProjectList>;
    try {
      const halResource = await this.openprojectService.fetchResource('/projects');
      const halProjects = halResource.prop('elements');
      const promises = halProjects.map((halProject: any) => halProject.links['categories'].fetch());
      await Promise.all(promises);
      const result = this.projectListAdapter.resourceToDto(this.projectAdapter, halResource);
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
