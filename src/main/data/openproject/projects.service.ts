import { inject, injectable } from 'inversify';
import * as os from 'os';
import 'reflect-metadata';

import { IDataRouterService, RoutedRequest } from '@data';
import { ILogService, IOpenprojectService } from '@core';
import { DataStatus, DtoDataResponse } from '@ipc';
import { DtoCategory, DtoProject } from '@ipc';

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
  private getProjects(request: RoutedRequest): Promise<DtoDataResponse<Array<DtoProject>>> {
    return this.openprojectService.fetchResource('/projects').then(
      hallResource => {
        const halProjects = hallResource.prop('elements');
        const result = new Array<DtoProject>();
        const promises = halProjects.map(project => project.links['categories'].fetch());
        return Promise.all(promises).then( () => {
          halProjects.forEach(project => {
            const categories = project.links['categories'].prop('elements').map(halCategory => {
              const dtoCategory: DtoCategory = {
                id: halCategory.prop('id'),
                name: halCategory.prop('name')
              };
              return dtoCategory;
            });
            const dtoProject: DtoProject = {
              categories,
              id: project.prop('id'),
              name: project.prop('name'),
              parentId: project.links['parent'].prop('id') ?
                project.links['parent'].prop('id') :
                undefined
            };
            result.push(dtoProject);
          });
          const response: DtoDataResponse<Array<DtoProject>> = {
            status: DataStatus.Ok,
            data: result
          };
          return response;
        });
      },
      err => {
        const response: DtoDataResponse<Array<DtoProject>> = {
          status: DataStatus.Error,
          message: `${err.name}: ${err.message}`
        };
        return response;
      }
    );
  }
  // </editor-fold>
}
