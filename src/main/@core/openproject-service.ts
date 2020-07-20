import { createClient, HalRestClient, createResource, URI } from 'hal-rest-client';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
var btoa = require('btoa');

import { ClientSettings } from './client-settings';
import { IHalResourceConstructor, IHalResource } from 'hal-rest-client/dist/hal-resource-interface';
import { ILogService } from './log.service';
import SERVICETYPES from './service.types';
import { LogSource } from '@ipc';

export interface IOpenprojectService {
  createFromCache<T extends IHalResource>(type: IHalResourceConstructor<T>, uri?: string | URI): T;
  post(resourceUri: string, data: Object, type:IHalResourceConstructor<any>): Promise<any>
  delete(resourceUri: string): Promise<any>;
  fetch<T extends IHalResource>(resourceUri: string, type: IHalResourceConstructor<T>): Promise<T>;
  patch<T extends IHalResource>(resourceUri: string, data: Object, type: IHalResourceConstructor<T>): Promise<T>;
  put(resourceUri: string, data: Object): Promise<any>
}

@injectable()
export class OpenprojectService implements IOpenprojectService {

  // <editor-fold desc='Private properties'>
  private client: HalRestClient;
  private apiRoot: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {

    this.apiRoot = ClientSettings.apiRoot;
    this.client = createClient(ClientSettings.apiHost, { withCredentials : true });
    this.client.interceptors
    this.client.interceptors.request.use(request => {
      logService.verbose(LogSource.Axios, '=>', request.method.padStart(4).padEnd(9) + this.buildLogUrl(request.url));
      logService.debug(LogSource.Axios, '=>', request.data);
      return request;
    });
    this.client.interceptors.response.use(response => {
      logService.verbose(LogSource.Axios, '<=', response.status, response.config.method.padEnd(9) + this.buildLogUrl(response.config.url));
      if (response.data){
        logService.debug(LogSource.Axios, '<=', response.data);
      }
      return response
    });

    this.client.addHeader('Authorization', 'Basic ' + btoa('apikey:' + ClientSettings.apiKey));
    this.client.addHeader('Accept', 'application/hal+json');
    this.client.addHeader('Content-Type', 'application/json application/hal+json');
  }
  // </editor-fold>

  // <editor-fold desc='IOpenprojectService interface members'>
  public createFromCache<T extends IHalResource>(type: IHalResourceConstructor<T>, uri?: string | URI): T {
    return createResource(this.client, type, uri);
  }

  public post(resourceUri: string, data: Object, type: IHalResourceConstructor<any>): Promise<any> {
    return this.client.create(this.buildUri(resourceUri), data || { }, type);
  }

  public delete(resourceUri: string): Promise<any> {
    return this.client.delete(this.buildUri(resourceUri));
  }

  public fetch<T extends IHalResource>(resourceUri: string, type: IHalResourceConstructor<T>): Promise<T> {
    return this.client.fetch(this.buildUri(resourceUri), type);
  }

  public patch<T extends IHalResource>(resourceUri: string, data: Object, type: IHalResourceConstructor<T>): Promise<T> {
    return this.client.update(this.buildUri(resourceUri), data, false, type);
  }

  public put(resourceUri: string, data: Object): Promise<any> {
    return this.client.update(this.buildUri(resourceUri), data, true);
  }
  // </editor-fold>

  // <editor-fold desc='private helper methods'>
  private buildUri(resourceUri: string) {
    return resourceUri.startsWith(`/${this.apiRoot}`) ?
      resourceUri :
      `/${this.apiRoot}${resourceUri}`;
  }

  private buildLogUrl(url: string) {
    const urlParts = url.split('?');
    return urlParts.length > 1 ? urlParts[0] + '?...' : urlParts[0];
  }
  // </editor-fold>//
}
