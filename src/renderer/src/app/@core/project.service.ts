import { Injectable } from '@angular/core';
import { LogService } from '@core/log.service';
import { DataVerb } from '@ipc';
import { DtoProjectList, DtoProject } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  //#region Private properties ------------------------------------------------
  private projects: Map<number, DtoProject>;
  private dataRequestFactory: DataRequestFactory;
  private ipcService: IpcService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dataRequestFactory: DataRequestFactory, ipcService: IpcService) {
      this.projects = undefined;
      this.dataRequestFactory = dataRequestFactory;
      this.ipcService = ipcService;
    }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public async getProjects(): Promise<Map<number, DtoProject>> {
    if (!this.projects) {
      const projects = await this.fetchProjects();
      projects.forEach(project => this.projects.set(project.id, project));
      return this.projects;
    }
    return Promise.resolve(this.projects);
  }

  public refresh(): void {
    this.projects = undefined;
    this.getProjects();
  }
  //#endregion

  //#region Privat methods ----------------------------------------------------
  private async fetchProjects(): Promise<Array<DtoProject>> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/projects');
    const response = await this.ipcService
      .untypedDataRequest<DtoProjectList>(request);
    return response.data.items;
  }
  //#endregion
}
