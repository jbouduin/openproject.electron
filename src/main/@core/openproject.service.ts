//TODO #1710 Get rid of @typescript-eslint/ban-types in main/@core/open-project.service.ts
/* eslint-disable @typescript-eslint/ban-types */
import { createClient, IHalRestClient, createResource, HalResource, cache } from '@jbouduin/hal-rest-client';
import { IHalResourceConstructor, IHalResource } from '@jbouduin/hal-rest-client';
import btoa from 'btoa';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

import { LogSource } from '@common';
import { DataStatus, DtoApiConfiguration, DtoOpenprojectInfo, DtoUntypedDataResponse } from '@common';
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
  put(resourceUri: string, data: Object): Promise<any>;
  validateConfig(apiConfig: DtoApiConfiguration): Promise<DtoUntypedDataResponse>;
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
    // TODO #1749 use client.removefromcache when available
    if (this.client) {
      cache.clear('Client', this.client.config.baseURL);
    }
    this.client = this.setInterceptors(createClient(this.apiConfig.apiHost, { withCredentials: true }));
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

  public post(resourceUri: string, data: Record<string, unknown>, type: IHalResourceConstructor<any>): Promise<Record<string, unknown>> {
    return this.client.create(this.buildUri(resourceUri), data || {}, type);
  }

  public delete(resourceUri: string): Promise<any> {
    return this.client.delete(this.buildUri(resourceUri));
  }

  public fetch<T extends IHalResource>(resourceUri: string, type: IHalResourceConstructor<T>): Promise<T> {
    return this.client.fetch<T>(this.buildUri(resourceUri), type);
  }

  public patch<T extends IHalResource>(resourceUri: string, data: Record<string, unknown>, type: IHalResourceConstructor<T>): Promise<T> {
    return this.client.update<T>(this.buildUri(resourceUri), data, false, type);
  }

  public put(resourceUri: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.update(this.buildUri(resourceUri), data, true);
  }

  public createResource<T extends IHalResource>(c: IHalResourceConstructor<T>, uri: string, templated: boolean): T {
    return createResource<T>(this.client, c, this.buildUri(uri), templated);
  }

  public validateConfig(apiConfig: DtoApiConfiguration): Promise<DtoUntypedDataResponse> {
    // create undefined to avoid using the current client
    const testClient = this.setInterceptors(createClient(undefined, { withCredentials: true }));
    testClient.addHeader('Authorization', 'Basic ' + btoa('apikey:' + apiConfig.apiKey));
    testClient.addHeader('Accept', 'application/hal+json');
    testClient.addHeader('Content-Type', 'application/json application/hal+json');
    return testClient.fetch(`${apiConfig.apiHost}/${apiConfig.apiRoot}`, HalResource)
      .then(() => {
        return { status: DataStatus.Ok };
      });
  }
  //#endregion

  //#region private helper methods --------------------------------------------
  private buildUri(resourceUri: string) {
    return resourceUri.startsWith(`/${this.apiConfig.apiRoot}`) ?
      resourceUri :
      `/${this.apiConfig.apiRoot}${resourceUri}`;
  }

  private setInterceptors(client: IHalRestClient): IHalRestClient {
    client.requestInterceptors.use(request => {
      if (request.data) {
        this.logService.debug(LogSource.Axios, `=> ${request.method.padStart(4).padEnd(9)} ${request.url}`, request.data);
      } else {
        this.logService.debug(LogSource.Axios, `=> ${request.method.padStart(4).padEnd(9)} ${request.url}`);
      }
      return request;
    });
    client.responseInterceptors.use(response => {
      if (response.data) {
        this.logService.debug(LogSource.Axios, `<= ${response.status} ${response.config.method.padEnd(9)} ${response.config.url}`, response.data);
      } else {
        this.logService.debug(LogSource.Axios, `<= ${response.status} ${response.config.method.padEnd(9)} ${response.config.url}`);
      }
      return response
    });
    return client;
  }
  //#endregion
}
