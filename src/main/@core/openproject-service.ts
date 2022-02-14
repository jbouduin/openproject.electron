//TODO #1710 Get rid of @typescript-eslint/ban-types in main/@core/open-project.service.ts
/* eslint-disable @typescript-eslint/ban-types */
import { createClient, IHalRestClient, createResource, HalResource } from '@jbouduin/hal-rest-client';
import btoa from 'btoa';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { ClientSettings } from './client-settings';
import { IHalResourceConstructor, IHalResource } from '@jbouduin/hal-rest-client';
import { ILogService } from './log.service';
import SERVICETYPES from './service.types';
import { DtoOpenprojectInfo, LogSource } from '@ipc';
import { BaseService } from '@data/base.service';

export interface IOpenprojectService {
  initialize(): Promise<DtoOpenprojectInfo>;
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
  private apiRoot: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService);
    this.apiRoot = ClientSettings.apiRoot;
    this.client = createClient(ClientSettings.apiHost, { withCredentials: true });
    this.client.requestInterceptors.use(request => {
      logService.verbose(LogSource.Axios, `=> ${request.method.padStart(4).padEnd(9)} ${this.buildLogUrl(request.url)}`);
      if (request.data) {
        logService.debug(LogSource.Axios, '=>', request.data);
      }
      return request;
    });
    this.client.responseInterceptors.use(response => {
      logService.verbose(LogSource.Axios, `<= ${response.status} ${response.config.method.padEnd(9)} ${this.buildLogUrl(response.config.url)}`);
      if (response.data) {
        logService.debug(LogSource.Axios, '<=', response.data);
      }
      return response
    });

    //eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    this.client.addHeader('Authorization', 'Basic ' + btoa('apikey:' + ClientSettings.apiKey));
    this.client.addHeader('Accept', 'application/hal+json');
    this.client.addHeader('Content-Type', 'application/json application/hal+json');
  }
  //#endregion

  //#region IOpenprojectService interface members -----------------------------
  public initialize(): Promise<DtoOpenprojectInfo> {
    // fill cache with some system wide data
    // this.client.fetchResource(`${this.apiRoot}/statuses`);
    // this.client.fetchResource(`${this.apiRoot}/types`);
    const result: DtoOpenprojectInfo = {
      coreVersion: '',
      instanceName: '',
      userName: '',
      apiRoot: this.apiRoot,
      host: ClientSettings.apiHost
    };

    return this.client.fetch(this.apiRoot, HalResource)
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
    return resourceUri.startsWith(`/${this.apiRoot}`) ?
      resourceUri :
      `/${this.apiRoot}${resourceUri}`;
  }

  private buildLogUrl(url: string) {
    const urlParts = url.split('?');
    return urlParts.length > 1 ? urlParts[0] + '?...' : urlParts[0];
  }
  //#endregion
}
