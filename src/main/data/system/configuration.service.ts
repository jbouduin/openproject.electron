import fs from 'fs';
import { IDataRouterService } from "@data/data-router.service";
import { IRoutedDataService } from "@data/routed-data-service";
import { DtoUntypedDataResponse } from "@ipc";
import { inject, injectable } from "inversify";
import Conf from 'conf';
import SERVICETYPES from "@core/service.types";
import { ILogService } from "@core";
import { app } from "electron";
import path from "path";
import { ClientSettings } from '@core/client-settings';

export interface IApiConfiguration {
  apiKey: string;
  apiHost: string;
  apiRoot: string;
}

export interface IConfigurationService extends IRoutedDataService {
  initialize(): IConfigurationService;
  getApiConfiguration(): IApiConfiguration;
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
    router.get('/config/:key', this.loadConfig.bind(this));
    router.post('/config/:key', this.writeConfig.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region IConfigurationService methods -------------------------------------
  public getApiConfiguration(): IApiConfiguration {
    return this.configuration.get('api') as IApiConfiguration;
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
    return this;
  }
  //#endregion

  //#region GET callback ------------------------------------------------------
  private loadConfig(): Promise<DtoUntypedDataResponse> {
    return null;
  }
  //#endregion

  //#region POST callback -----------------------------------------------------
  private writeConfig(): Promise<DtoUntypedDataResponse> {
    return null;
  }
  //#endregion
}