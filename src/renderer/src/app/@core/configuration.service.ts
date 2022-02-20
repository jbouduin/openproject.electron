import { Injectable } from "@angular/core";
import { DataVerb, DtoConfiguration, DtoUntypedDataRequest } from "@ipc";
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
    return response.data;
  }

  public saveConfiguration(configuration: DtoConfiguration): void {
    const request = this.dataRequestFactory.createDataRequest<DtoConfiguration>(DataVerb.POST, '/config', configuration);
    void this.ipcService.dataRequest(request);
  }
  //#endregion

}