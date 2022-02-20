//TODO #1710 Get rid of @typescript-eslint/ban-types in main/@core/open-project.service.ts
/* eslint-disable @typescript-eslint/ban-types */
import { createClient, IHalRestClient, createResource, HalResource } from '@jbouduin/hal-rest-client';
import { IHalResourceConstructor, IHalResource } from '@jbouduin/hal-rest-client';
import btoa from 'btoa';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

import { LogSource } from '@common';
import { DtoApiConfiguration, DtoOpenprojectInfo } from '@ipc';
import { BaseService } from '@data/base.service';
import { ILogService } from './log.service';
import SERVICETYPES from './service.types';

export interface IOpenprojectService {
  initialize(apiConfig: DtoApiConfiguration): Promise<DtoOpenprojectInfo>;
  createResource<T extends IHalResource>(c: IHalResourceConstructor<T>, uri: string, templated: boolean): T
  post(resourceUri: string, data: Object, type: IHalResourceConstructor<any>): Promise<any>
  delete(resourceUri: string): Promise<any>;
  fetch<T extends IHalResource>(resourceUri: string, type: IHalResourceConstructor<T>): Promise<T>;
  patch<T extends IHalResource>(resourceUri: string, data: Object, type: IHalResourceConstructor<T>): Promise<T>;
  put(resourceUri: string, data: Object): Promise<any>
}

@injectable()
export class OpenprojectService extends BaseService implements IOpenprojectService {

  //#region Private properties ------------------------------------------------
  private client: IHalRestClient;
  private apiConfig: DtoApiConfiguration;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService);
  }
  //#endregion

  //#region IOpenprojectService interface members -----------------------------
  public initialize(apiConfig: DtoApiConfiguration): Promise<DtoOpenprojectInfo> {
    this.apiConfig = apiConfig;
    this.client = createClient(this.apiConfig.apiHost, { withCredentials: true });
    this.client.requestInterceptors.use(request => {
      if (request.data) {
        this.logService.debug(LogSource.Axios, `=> ${request.method.padStart(4).padEnd(9)} ${request.url}`, request.data);
      } else {
        this.logService.debug(LogSource.Axios, `=> ${request.method.padStart(4).padEnd(9)} ${request.url}`);
      }
      return request;
    });
    this.client.responseInterceptors.use(response => {
      if (response.data) {
        this.logService.debug(LogSource.Axios, `<= ${response.status} ${response.config.method.padEnd(9)} ${response.config.url}`, response.data);
      } else {
        this.logService.debug(LogSource.Axios, `<= ${response.status} ${response.config.method.padEnd(9)} ${response.config.url}`);
      }
      return response
    });

    this.client.addHeader('Authorization', 'Basic ' + btoa('apikey:' + this.apiConfig.apiKey));
    this.client.addHeader('Accept', 'application/hal+json');
    this.client.addHeader('Content-Type', 'application/json application/hal+json');
    const result: DtoOpenprojectInfo = {
      coreVersion: '',
      instanceName: '',
      userName: '',
      apiRoot: this.apiConfig.apiRoot,
      host: this.apiConfig.apiHost
    };

    return this.client.fetch(this.apiConfig.apiRoot, HalResource)
      .then((root: HalResource) => {
        result.coreVersion = root.getProperty('coreVersion');
        result.instanceName = root.getProperty('instanceName');
        return root.getLink<IHalResource>('user').fetch();
      })
      .then((user: HalResource) => {
        result.userName = user.getProperty('name');
        return result;
      });
  }

  public post(resourceUri: string, data: Object, type: IHalResourceConstructor<any>): Promise<any> {
    return this.client.create(this.buildUri(resourceUri), data || {}, type);
  }

  public delete(resourceUri: string): Promise<any> {
    return this.client.delete(this.buildUri(resourceUri));
  }

  public fetch<T extends IHalResource>(resourceUri: string, type: IHalResourceConstructor<T>): Promise<T> {
    return this.client.fetch<T>(this.buildUri(resourceUri), type);
  }

  public patch<T extends IHalResource>(resourceUri: string, data: Object, type: IHalResourceConstructor<T>): Promise<T> {
    return this.client.update<T>(this.buildUri(resourceUri), data, false, type);
  }

  public put(resourceUri: string, data: Object): Promise<any> {
    return this.client.update(this.buildUri(resourceUri), data, true);
  }

  public createResource<T extends IHalResource>(c: IHalResourceConstructor<T>, uri: string, templated: boolean): T {
    return createResource<T>(this.client, c, this.buildUri(uri), templated);
  }
  //#endregion

  //#region private helper methods --------------------------------------------
  private buildUri(resourceUri: string) {
    return resourceUri.startsWith(`/${this.apiConfig.apiRoot}`) ?
      resourceUri :
      `/${this.apiConfig.apiRoot}${resourceUri}`;
  }
  //#endregion
}
