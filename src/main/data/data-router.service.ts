import * as events from 'events';
import { inject, injectable } from 'inversify';
import * as _ from 'lodash';
import { match, MatchResult } from 'path-to-regexp';
import * as Collections from 'typescript-collections';
import * as util from 'util';
import 'reflect-metadata';

import { DataStatus, DataVerb, DtoDataRequest, DtoDataResponse, DtoUntypedDataResponse } from '@ipc';
import { ISystemService } from './system/system.service';
import { RoutedRequest } from './routed-request';

import SERVICETYPES from '../di/service.types';

export interface IDataRouterService {
  delete(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>);
  get(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>);
  // PATCH is not used
  post(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>);
  put(path: string, callback: (request: RoutedRequest) => Promise<DtoDataResponse<any>>);
  initialize(): void;
  routeRequest(request: DtoDataRequest<any>): Promise<DtoDataResponse<any>>;
}

type RouteCallback = (request: RoutedRequest) => Promise<DtoDataResponse<any>>;

@injectable()
export class DataRouterService implements IDataRouterService {

  // <editor-fold desc='Private properties'>
  private deleteRoutes: Collections.Dictionary<string, RouteCallback>;
  private getRoutes: Collections.Dictionary<string, RouteCallback>;
  private postRoutes: Collections.Dictionary<string, RouteCallback>;
  private putRoutes: Collections.Dictionary<string, RouteCallback>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.SystemService) private systemService: ISystemService) {
    this.deleteRoutes = new Collections.Dictionary<string, RouteCallback>();
    this.getRoutes = new Collections.Dictionary<string, RouteCallback>();
    this.postRoutes = new Collections.Dictionary<string, RouteCallback>();
    this.putRoutes = new Collections.Dictionary<string, RouteCallback>();
  }
  // </editor-fold>

  // <editor-fold desc='IService interface methods'>
  public initialize(): void {
    console.log('in initialize DataRouterService');
    this.systemService.setRoutes(this);
    console.log('registered DELETE routes:');
    this.deleteRoutes.keys().forEach(route => console.log(route));
    console.log('registered GET routes:');
    this.getRoutes.keys().forEach(route => console.log(route));
    console.log('registered POST routes:');
    this.postRoutes.keys().forEach(route => console.log(route));
    console.log('registered PUT routes:');
    this.putRoutes.keys().forEach(route => console.log(route));
  }
  // </editor-fold>

  // <editor-fold desc='IDataRouterService interface methods'>
  public delete(path: string, callback: RouteCallback) {
    this.deleteRoutes.setValue(path, callback);
  }

  public get(path: string, callback: RouteCallback) {
    this.getRoutes.setValue(path, callback);
  }

  public post(path: string, callback: RouteCallback) {
    this.postRoutes.setValue(path, callback);
  }

  public put(path: string, callback: RouteCallback) {
    this.putRoutes.setValue(path, callback);
  }

  public routeRequest(request: DtoDataRequest<any>): Promise<DtoDataResponse<any>> {
    let result: Promise<DtoDataResponse<any>>;
    console.log(`routing ${DataVerb[request.verb]} ${request.path}`);
    let routeDictionary: Collections.Dictionary<string, RouteCallback>;
    switch(request.verb) {
      case (DataVerb.DELETE): {
        routeDictionary = this.deleteRoutes;
        break;
      }
      case (DataVerb.GET): {
        routeDictionary = this.getRoutes;
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
      console.log('not allowed');
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
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private route(
    request: DtoDataRequest<any>,
    routeDictionary: Collections.Dictionary<string, RouteCallback>): Promise<DtoDataResponse<any>> {
    let result: Promise<DtoDataResponse<any>>;

    const splittedPath = request.path.split('?');

    const matchedKey = routeDictionary.keys().find(key => {
      const matcher = match(key);
      const matchResult = matcher(splittedPath[0]);
      return matchResult !== false;
    });

    if (matchedKey)
    {
      const matcher2 = match(matchedKey);
      const matchResult2: any = matcher2(splittedPath[0]);

      if (_.isObject(matchResult2)) {
        console.log(`Route found: ${matchedKey}`);
        const routedRequest = new RoutedRequest();
        routedRequest.route = matchedKey
        routedRequest.path = matchResult2.path;
        routedRequest.params = matchResult2.params;
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
        const route = routeDictionary.getValue(matchedKey);
        if (route) {
          console.debug(routedRequest);
          result = route(routedRequest);
        }
      } else {
        console.error('strange error!');
        const response: DtoDataResponse<string> = {
          status: DataStatus.Error,
          data: 'Error in router'
        };
        result = Promise.resolve(response);
      }
    } else {
      console.error('Route not found');
      const response: DtoDataResponse<string> = {
        status: DataStatus.NotFound,
        data: ''
      };
      result = Promise.resolve(response);
    }
    return result;
  }

  // </editor-fold>
}
