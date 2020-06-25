import { createClient, HalResource, HalRestClient } from 'hal-rest-client';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
var btoa = require('btoa');

import { ClientSettings } from './client-settings';
import { IHalResourceConstructor, IHalResource } from 'hal-rest-client/dist/hal-resource-interface';
import { ILogService } from './log.service';
import SERVICETYPES from './service.types';
import { LogSource } from '@ipc';

export interface IOpenprojectService {
  createResource(resourceUri: string, resource: Object): Promise<any>
  deleteResource(resourceUri: string): Promise<any>;
  fetchResource(resourceUri: string): Promise<HalResource>;
  fetch<T extends IHalResource>(resourceUri: string, c: IHalResourceConstructor<T>): Promise<T>;
  patchResource(resourceUri: string, resource: HalResource): Promise<any>
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
      logService.debug(LogSource.Main, '=>', request.method.padStart(4).padEnd(8), this.buildLogUrl(request.url));
      return request;
    });
    this.client.interceptors.response.use(response => {
      logService.debug(LogSource.Main, '<=', response.status, response.config.method.padEnd(8), this.buildLogUrl(response.config.url));
      return response
    });

    this.client.addHeader('Authorization', 'Basic ' + btoa('apikey:' + ClientSettings.apiKey));
    this.client.addHeader('Accept', 'application/hal+json');
    this.client.addHeader('Content-Type', 'application/json application/hal+json');
  }
  // </editor-fold>

  // <editor-fold desc='IOpenprojectService interface members'>
  public createResource(resourceUri: string, resource: Object): Promise<any> {
    return this.client.create(this.buildUri(resourceUri), resource);
  }

  public deleteResource(resourceUri: string): Promise<any> {
    return this.client.delete(this.buildUri(resourceUri));
  }

  public fetchResource(resourceUri: string): Promise<HalResource> {
    return this.client.fetchResource(this.buildUri(resourceUri));
  }

  public fetch<T extends IHalResource>(resourceUri: string, c: IHalResourceConstructor<T>): Promise<T> {
    return this.client.fetch(this.buildUri(resourceUri), c);
  }

  public patchResource(resourceUri: string, resource: HalResource): Promise<any> {
    return this.client.update(this.buildUri(resourceUri), resource, false);
  }

  public putResource(resourceUri: string, resource: HalResource): Promise<any> {
    return this.client.update(this.buildUri(resourceUri), resource, true);
  }
  // </editor-fold>

  // <editor-fold desc='private helper methods'>
  private buildUri(resourceUri: string) {
    const result = `/${this.apiRoot}${resourceUri}`;
    return result;
  }

  private buildLogUrl(url: string) {
    const urlParts = url.split('?');
    return urlParts.length > 1 ? urlParts[0] + '?...' : urlParts[0];
  }
  // </editor-fold>//
}
