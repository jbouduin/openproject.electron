import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { match, MatchResult } from 'path-to-regexp';
import 'reflect-metadata';

import { ILogService } from '@core';
import { DataVerb, DtoDataRequest } from '@ipc';
import { DataStatus, DtoDataResponse, DtoUntypedDataResponse } from '@ipc';
import { LogSource } from '@ipc';

import { IMonthlyReportService } from './export';
import { IProjectReportService } from './export';
import { ITimesheetExportService } from './export';
import { ICacheService, IProjectsService, IWorkPackageTypeService } from './openproject';
import { ITimeEntriesService } from './openproject';
import { IWorkPackagesService } from './openproject';
import { ISystemService } from './system';

import { RoutedRequest } from './routed-request';

import SERVICETYPES from '../@core/service.types';

export interface IDataRouterService {
  delete(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>): void;
  get(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>): void;
  patch(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>): void;
  post(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>): void;
  put(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>): void;
  initialize(): void;
  routeRequest(request: DtoDataRequest<any>): Promise<DtoDataResponse<any>>;
}

type RouteCallback = (request: RoutedRequest) => Promise<DtoDataResponse<any>>;

@injectable()
export class DataRouterService implements IDataRouterService {

  //#region Private properties
  private deleteRoutes: Map<string, RouteCallback>;
  private getRoutes: Map<string, RouteCallback>;
  private patchRoutes: Map<string, RouteCallback>;
  private postRoutes: Map<string, RouteCallback>;
  private putRoutes: Map<string, RouteCallback>;
  //#endregion

  //#region Constructor & C°
  public constructor(
    @inject(SERVICETYPES.LogService) private logService: ILogService,
    @inject(SERVICETYPES.CacheService) private cacheService: ICacheService,
    @inject(SERVICETYPES.MonthlyReportService) private monthlyReportService: IMonthlyReportService,
    @inject(SERVICETYPES.ProjectsService) private projectService: IProjectsService,
    @inject(SERVICETYPES.ProjectReportService) private projectReportService: IProjectReportService,
    @inject(SERVICETYPES.SystemService) private systemService: ISystemService,
    @inject(SERVICETYPES.TimesheetExportService) private timesheetExportService: ITimesheetExportService,
    @inject(SERVICETYPES.TimeEntriesService) private timeEntriesService: ITimeEntriesService,
    @inject(SERVICETYPES.WorkPackagesService) private workPackageService: IWorkPackagesService,
    @inject(SERVICETYPES.WorkPackageTypeService) private workPackTypeService: IWorkPackageTypeService) {
    this.deleteRoutes = new Map<string, RouteCallback>();
    this.getRoutes = new Map<string, RouteCallback>();
    this.patchRoutes = new Map<string, RouteCallback>();
    this.postRoutes = new Map<string, RouteCallback>();
    this.putRoutes = new Map<string, RouteCallback>();
  }
  //#endregion

  //#region IDateRouterService interface methods
  public initialize(): void {
    this.logService.verbose(LogSource.Main, 'in initialize DataRouterService');
    this.timesheetExportService.setRoutes(this);
    this.cacheService.setRoutes(this);
    this.monthlyReportService.setRoutes(this);
    this.projectService.setRoutes(this);
    this.projectReportService.setRoutes(this);
    this.systemService.setRoutes(this);
    this.timeEntriesService.setRoutes(this);
    this.workPackageService.setRoutes(this);
    this.workPackTypeService.setRoutes(this);

    this.logService.verbose(LogSource.Main, 'registered DELETE routes:');
    this.deleteRoutes.forEach((_value: RouteCallback, key: string) => this.logService.verbose(LogSource.Main, key));
    this.logService.verbose(LogSource.Main, 'registered GET routes:');
    this.getRoutes.forEach((_value: RouteCallback, key: string) => this.logService.verbose(LogSource.Main, key));
    this.logService.verbose(LogSource.Main, 'registered PATCH routes:');
    this.patchRoutes.forEach((_value: RouteCallback, key: string) => this.logService.verbose(LogSource.Main, key));
    this.logService.verbose(LogSource.Main, 'registered POST routes:');
    this.postRoutes.forEach((_value: RouteCallback, key: string) => this.logService.verbose(LogSource.Main, key));
    this.logService.verbose(LogSource.Main, 'registered PUT routes:');
    this.putRoutes.forEach((_value: RouteCallback, key: string) => this.logService.verbose(LogSource.Main, key));
  }

  public delete(path: string, callback: RouteCallback): void {
    this.deleteRoutes.set(path, callback);
  }

  public get(path: string, callback: RouteCallback): void {
    this.getRoutes.set(path, callback);
  }

  public patch(path: string, callback: RouteCallback): void {
    this.patchRoutes.set(path, callback);
  }

  public post(path: string, callback: RouteCallback): void {
    this.postRoutes.set(path, callback);
  }

  public put(path: string, callback: RouteCallback): void {
    this.putRoutes.set(path, callback);
  }

  public routeRequest(request: DtoDataRequest<any>): Promise<DtoDataResponse<any>> {
    let result: Promise<DtoDataResponse<any>>;
    this.logService.verbose(LogSource.Main, `routing ${DataVerb[request.verb]} ${request.path}`);
    let routeDictionary: Map<string, RouteCallback>;
    switch(request.verb) {
      case (DataVerb.DELETE): {
        routeDictionary = this.deleteRoutes;
        break;
      }
      case (DataVerb.GET): {
        routeDictionary = this.getRoutes;
        break;
      }
      case (DataVerb.PATCH): {
        routeDictionary = this.patchRoutes;
        break;
      }
      case (DataVerb.POST): {
        routeDictionary = this.postRoutes;
        break;
      }
      case (DataVerb.PUT): {
        routeDictionary = this.putRoutes;
        break;
      }
    }
    if (!routeDictionary) {
      this.logService.verbose(LogSource.Main, 'not allowed');
      const response: DtoUntypedDataResponse = {
        status: DataStatus.NotAllowed
      };
      result = Promise.resolve(response);
    }
    else {
      result = this.route(request, routeDictionary)
    }
    return result;
  }
  //#endregion

  //#region Private methods
  private route(
    request: DtoDataRequest<any>,
    routeDictionary: Map<string, RouteCallback>): Promise<DtoDataResponse<any>> {
    let result: Promise<DtoDataResponse<any>>;

    try {
      const splittedPath = request.path.split('?');
      const routes = Array.from(routeDictionary.keys());
      const matchedKey = routes.find(key => {
        const matcher = match(key);
        const matchResult = matcher(splittedPath[0]);
        return matchResult !== false;
      });

      if (matchedKey)
      {
        const matcher2 = match(matchedKey);
        const matchResult2: any = matcher2(splittedPath[0]);

        if (_.isObject(matchResult2)) {
          this.logService.verbose(LogSource.Main, `Route found: ${matchedKey}`);
          const routedRequest = new RoutedRequest();
          routedRequest.dataVerb = request.verb;
          routedRequest.route = matchedKey
          routedRequest.path = (matchResult2 as MatchResult).path;
          routedRequest.params = (matchResult2 as MatchResult).params;
          routedRequest.data = request.data;
          routedRequest.queryParams = { };
          if (splittedPath.length > 1) {
            const queryParts = splittedPath[1].split('&');
            queryParts.forEach(part => {
              const kvp = part.split('=');
              if (kvp.length > 1) {
                routedRequest.queryParams[kvp[0]] = kvp[1];
              }
            });
          }
          const route = routeDictionary.get(matchedKey);
          if (route) {
            this.logService.debug(LogSource.Main, routedRequest);
            result = route(routedRequest);
          }
        } else {
          this.logService.error(LogSource.Main, 'strange error!');
          const response: DtoDataResponse<string> = {
            status: DataStatus.Error,
            data: 'Error in router'
          };
          result = Promise.resolve(response);
        }
      } else {
        this.logService.error(LogSource.Main, 'Route not found');
        const response: DtoDataResponse<string> = {
          status: DataStatus.NotFound,
          data: ''
        };
        result = Promise.resolve(response);
      }
    } catch (error) {
      this.logService.error(LogSource.Main, 'Error when routing', request, error);
      const response: DtoDataResponse<string> = {
        status: DataStatus.Error,
        data: `Error when routing ${request.path}`
      };
      result = Promise.resolve(response);
    }
    return result;
  }
  //#endregion
}
