import { inject, injectable } from 'inversify';
import * as os from 'os';
import 'reflect-metadata';

import { IDataRouterService, RoutedRequest } from '@data';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse } from '@ipc';

import { IDataService } from '../data-service';

import SERVICETYPES from '../../@core/service.types';

export interface IProjectsService extends IDataService { }

@injectable()
export class ProjectsService implements IProjectsService {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) private logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) private openprojectService: IOpenprojectService) { }
  // </editor-fold>

  // <editor-fold desc='ISomeService Interface methods'>
  public setRoutes(router: IDataRouterService): void {
    router.get('/projects', this.getProjects.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='GET routes callback'>
  private getProjects(request: RoutedRequest): Promise<DtoDataResponse<Array<string>>> {
    return this.openprojectService.fetchResource('/projects').then(
      projects => {
        const result = new Array<string>()
        projects.prop('elements').forEach(project => result.push(project.prop('name')));
        const response: DtoDataResponse<Array<string>> = {
          status: DataStatus.Ok,
          data: result
        };
        return response;
      },
      err => {
        const response: DtoDataResponse<Array<string>> = {
          status: DataStatus.Error,
          message: `${err.name}: ${err.message}`
        };
        return response;
      }
    );
  }
  // </editor-fold>
}
