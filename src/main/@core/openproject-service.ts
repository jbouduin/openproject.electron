import { createClient, HalRestClient } from 'hal-rest-client';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
var btoa = require('btoa');

import { ClientSettings } from './client-settings';
import { IHalResourceConstructor, IHalResource } from 'hal-rest-client/dist/hal-resource-interface';
import { ILogService } from './log.service';
import SERVICETYPES from './service.types';
import { LogSource } from '@ipc';

export interface IOpenprojectService {
  post(resourceUri: string, type:IHalResourceConstructor<any>, data: Object): Promise<any>
  delete(resourceUri: string): Promise<any>;
  // fetchResource(resourceUri: string): Promise<HalResource>;
  fetch<T extends IHalResource>(resourceUri: string, c: IHalResourceConstructor<T>): Promise<T>;
  patch<T extends IHalResource>(resourceUri: string, data: Object, c: IHalResourceConstructor<T>): Promise<T>;
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
      logService.debug(LogSource.Axios, '=>', request.method.padStart(4).padEnd(8), this.buildLogUrl(request.url));
      return request;
    });
    this.client.interceptors.response.use(response => {
      logService.debug(LogSource.Axios, '<=', response.status, response.config.method.padEnd(8), this.buildLogUrl(response.config.url));
      return response
    });

    this.client.addHeader('Authorization', 'Basic ' + btoa('apikey:' + ClientSettings.apiKey));
    this.client.addHeader('Accept', 'application/hal+json');
    this.client.addHeader('Content-Type', 'application/json application/hal+json');
  }
  // </editor-fold>

  // <editor-fold desc='IOpenprojectService interface members'>
  public post(resourceUri: string, type:IHalResourceConstructor<any>, data: Object): Promise<any> {
    return this.client.create(this.buildUri(resourceUri), data || { }, type);
  }

  public delete(resourceUri: string): Promise<any> {
    return this.client.delete(this.buildUri(resourceUri));
  }

  // public fetchResource(resourceUri: string): Promise<HalResource> {
  //   return this.client.fetchResource(this.buildUri(resourceUri));
  // }

  public fetch<T extends IHalResource>(resourceUri: string, c: IHalResourceConstructor<T>): Promise<T> {
    return this.client.fetch(this.buildUri(resourceUri), c);
  }

  public patch<T extends IHalResource>(resourceUri: string, data: Object, c: IHalResourceConstructor<T>): Promise<T> {
    return this.client.update(this.buildUri(resourceUri), data, false, c);
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
