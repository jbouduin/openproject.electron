import { Inject, Injectable } from '@angular/core';
import * as Collections from 'typescript-collections';

import { DataVerb, DtoSystemInfo, DtoUntypedDataRequest } from '@ipc';
import { DtoProject } from '@ipc';

import { IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  // <editor-fold desc='Private properties'>
  private _projects: Collections.Dictionary<number, DtoProject>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private ipcService: IpcService) {
    this._projects = new Collections.Dictionary<number, DtoProject>();
  }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public projects(): Promise<Array<DtoProject>> {
    if (this._projects.size() === 0) {
      return this.fetchProjects().then(projects => {
        projects.forEach(project => this._projects.setValue(project.id, project));
        return projects;
      });
    }
    return Promise.resolve(this._projects.values());
  }

  public refresh(): void {
    this.fetchProjects().then(projects => {
      projects.forEach(project => this._projects.setValue(project.id, project))
    });
  }
  // </editor-fold>

  // <editor-fold desc='Privat methods'>
  private fetchProjects(): Promise<Array<DtoProject>> {
    const request: DtoUntypedDataRequest = {
      verb: DataVerb.GET,
      path: '/projects',
    };

    return this.ipcService
      .untypedDataRequest<Array<DtoProject>>(request)
      .then(response => response.data);
  }
  // </editor-fold>
}
