import { Injectable } from "@angular/core";
import { DataStatus, DataVerb, DtoConfiguration, DtoUntypedDataRequest, DtoUntypedDataResponse } from '@common';
import { DataRequestFactory, IpcService } from "./ipc";
import { LogService } from "./log.service";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  //#region private properties ------------------------------------------------
  private dataRequestFactory: DataRequestFactory;
  private ipcService: IpcService;
  private logService: LogService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dataRequestFactory: DataRequestFactory,
    ipcService: IpcService,
    logService: LogService) {
    this.dataRequestFactory = dataRequestFactory;
    this.ipcService = ipcService;
    this.logService = logService;
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public async loadConfiguration(): Promise<DtoConfiguration> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/config');
    const response = await this.ipcService.dataRequest<DtoUntypedDataRequest, DtoConfiguration>(request);
    console.log('config loaded');
    return response.data;
  }

  public async saveConfiguration(configuration: DtoConfiguration, verb: DataVerb, path: string): Promise<DtoUntypedDataResponse> {
    const request = this.dataRequestFactory.createDataRequest<DtoConfiguration>(verb, path, configuration);
    const result = await this.ipcService.dataRequest<DtoConfiguration, DtoUntypedDataResponse>(request);
    return result;
  }
  //#endregion

}