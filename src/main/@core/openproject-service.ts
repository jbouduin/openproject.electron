import { createClient, HalResource, HalRestClient } from 'hal-rest-client';
import { injectable } from 'inversify';
import 'reflect-metadata';

var btoa = require('btoa');
import { ClientSettings } from './client-settings';

export interface IOpenprojectService {
  deleteResource(resourceUri: string): Promise<any>;
  fetchResource(resourceUri: string): Promise<HalResource>;
  patchResource(resourceUri: string, resource: HalResource): Promise<any>
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
    this.client.addHeader('Content-Type', 'application/json application/hal+json');
  }
  // </editor-fold>

  // <editor-fold desc='IOpenprojectService interface members'>
  public deleteResource(resourceUri: string): Promise<any> {
    return this.client.delete(this.buildUri(resourceUri));
  }

  public fetchResource(resourceUri: string): Promise<HalResource> {
    return this.client.fetchResource(this.buildUri(resourceUri));
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
  // </editor-fold>//
}
