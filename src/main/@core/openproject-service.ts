import * as btoa from 'btoa';
import { createClient, HalResource, HalRestClient } from 'hal-rest-client';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { ClientSettings } from './client-settings';

export interface IOpenprojectService {
  deleteResource(resourceUri: string): Promise<any>;
  fetchResource(resourceUri: string): Promise<HalResource>;
}

@injectable()
export class OpenprojectService implements IOpenprojectService {

  // <editor-fold desc='Private properties'>
  private client: HalRestClient;
  private apiRoot: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.apiRoot = ClientSettings.apiRoot;
    this.client = createClient(ClientSettings.apiHost, { withCredentials : true });
    this.client.addHeader('Authorization', 'Basic ' + btoa('apikey:' + ClientSettings.apiKey));
    this.client.addHeader('Accept', 'application/hal+json');
  }
  // </editor-fold>

  // <editor-fold desc='IOpenprojectService interface members'>
  public deleteResource(resourceUri: string): Promise<any> {
    return this.client.delete(this.buildUri(resourceUri));
  }

  public fetchResource(resourceUri: string): Promise<HalResource> {
    return this.client.fetchResource(this.buildUri(resourceUri));
  }
  // </editor-fold>

  // <editor-fold desc='private helper methods'>
  private buildUri(resourceUri: string) {
    const result = `/${this.apiRoot}${resourceUri}`;
    return result;
  }
  // </editor-fold>//
}
