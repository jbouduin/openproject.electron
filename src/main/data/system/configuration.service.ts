import fs from 'fs';
import { IDataRouterService } from "@data/data-router.service";
import { IRoutedDataService } from "@data/routed-data-service";
import { DataStatus, DtoApiConfiguration, DtoConfiguration, DtoDataResponse, DtoLogConfiguration, DtoLogLevelConfiguration, DtoUntypedDataResponse } from "@ipc";
import { inject, injectable } from "inversify";
import Conf from 'conf';
import SERVICETYPES from "@core/service.types";
import { ILogService } from "@core";
import { app } from "electron";
import path from "path";
import { ClientSettings } from '@core/client-settings';
import { LogLevel, LogSource } from '@common';

export interface IConfigurationService extends IRoutedDataService {
  initialize(): IConfigurationService;
  getApiConfiguration(): DtoApiConfiguration;
  getLogConfiguration(): DtoLogConfiguration;
}

@injectable()
export class ConfigurationService implements IConfigurationService {

  //#region private properties ------------------------------------------------
  private logService: ILogService;
  private configuration: Conf;
  //#endregion

  //#region Constructor &C° ---------------------------------------------------
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    this.logService = logService;
  }
  //#endregion

  //#region IRoutedDataService Interface methods ------------------------------
  public setRoutes(router: IDataRouterService): void {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.get('/config', this.getConfig.bind(this));
    router.patch('/config', this.saveConfig.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region IConfigurationService methods -------------------------------------
  public getApiConfiguration(): DtoApiConfiguration {
    return this.configuration.get('api') as DtoApiConfiguration;
  }

  public getLogConfiguration(): DtoLogConfiguration {
    return this.configuration.get('log') as DtoLogConfiguration;
  }
  public initialize(): IConfigurationService {
    const schemaContents = fs.readFileSync(path.resolve(app.getAppPath(), 'dist/main/static/configuration.schema.json'), 'utf-8');
    const schema = JSON.parse(schemaContents);
    this.configuration = new Conf({ schema });
    if (!this.configuration.get('api')) {
      this.configuration.set('api.apiKey', ClientSettings.apiKey);
      this.configuration.set('api.apiRoot', ClientSettings.apiRoot);
      this.configuration.set('api.apiHost', ClientSettings.apiHost);
    }
    if (!this.configuration.get('log')) {
      const log: DtoLogConfiguration = {
        levels: new Array<DtoLogLevelConfiguration>(
          { logSource: LogSource.Axios, logLevel: LogLevel.Debug },
          { logSource: LogSource.Main, logLevel: LogLevel.Debug },
          { logSource: LogSource.Renderer, logLevel: LogLevel.Debug }
        )
      };
      this.configuration.set('log', log);
    }
    return this;
  }
  //#endregion

  //#region GET callback ------------------------------------------------------
  private getConfig(): Promise<DtoDataResponse<DtoConfiguration>> {
    const result: DtoConfiguration = {
      api: this.getApiConfiguration(),
      log: this.getLogConfiguration()
    };
    return Promise.resolve({
      status: DataStatus.Ok,
      data: result
    });
  }
  //#endregion

  //#region POST callback -----------------------------------------------------
  private saveConfig(): Promise<DtoUntypedDataResponse> {
    const response: DtoUntypedDataResponse = {
      status: DataStatus.Ok,
      message: 'OK, but with message'
    }
    return Promise.resolve(response);
  }
  //#endregion
}