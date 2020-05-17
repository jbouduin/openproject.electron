import { Inject, Injectable } from '@angular/core';
import * as Collections from 'typescript-collections';


import { DataVerb, DtoSystemInfo, DtoUntypedDataRequest } from '@ipc';
import { DtoProjectList, DtoProject, DtoTimeEntryList, DtoTimeEntry } from '@ipc';

import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  // <editor-fold desc='Private properties'>
  private _projects: Collections.Dictionary<number, DtoProject>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private dataRequestFactory: DataRequestFactory, private ipcService: IpcService) {
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

  public timeEntries(): Promise<Array<DtoTimeEntry>> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/time-entries');
    return this.ipcService
     .untypedDataRequest<DtoTimeEntryList>(request)
     .then(response => response.data.items);
  }
  // </editor-fold>

  // <editor-fold desc='Privat methods'>
  private fetchProjects(): Promise<Array<DtoProject>> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/projects');

    return this.ipcService
      .untypedDataRequest<DtoProjectList>(request)
      .then(response => {
        console.log(response);
        return response.data.items;

      });
  }
  // </editor-fold>
}
