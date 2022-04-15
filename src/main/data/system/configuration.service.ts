import fs from 'fs';
import { IDataRouterService, RouteCallback } from '@data/data-router.service';
import { IRoutedDataService } from '@data/routed-data-service';
import { DataStatus, DtoApiConfiguration, DtoConfiguration, DtoDataRequest, DtoDataResponse } from '@common';
import { DtoLogConfiguration, DtoLogLevelConfiguration, DtoOpenprojectInfo, DtoUntypedDataResponse } from '@common';
import { inject, injectable } from 'inversify';
import Conf from 'conf';
import SERVICETYPES from '@core/service.types';
import { ILogService, IOpenprojectService } from '@core';
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { LogLevel, LogSource } from '@common';
import { resumeInitialization } from 'main';
import { BaseDataService } from '@data/base-data-service';

export interface IPosition {
  x: number;
  y: number;
}

export interface ISize {
  height: number,
  width: number
}
export interface IWindow {
  position?: IPosition;
  size: ISize;
  maximized: boolean;
  minimized: boolean;
}

export interface IConfigurationService extends IRoutedDataService {
  devtoolsConfiguration: boolean;
  window: IWindow;
  loadConfiguration(): IConfigurationService;
  setBrowserWindow(browserWindow: BrowserWindow): IConfigurationService;
  getApiConfiguration(): DtoApiConfiguration;
  getLogConfiguration(): DtoLogConfiguration;
}


@injectable()
export class ConfigurationService extends BaseDataService implements IConfigurationService {

  //#region private properties ------------------------------------------------
  private configuration: Conf;
  private browserWindow: BrowserWindow;
  //#endregion

  //#region BasedataService abstract member implementation --------------------
  protected get entityRoot(): string { return ''; }
  //#endregion

  //#region IConfigurationService getters/setters -----------------------------
  public get devtoolsConfiguration(): boolean {
    return this.configuration.get('devtools') as boolean;
  }

  public set devtoolsConfiguration(value: boolean) {
    this.configuration.set('devtools', value);
  }

  public get window(): IWindow {
    return this.configuration.get('window') as IWindow
  }

  public set window(value: IWindow) {
    this.configuration.set('window', value);
  }
  //#endregion

  //#region Constructor &C° ---------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.OpenprojectService) openProjectService: IOpenprojectService,
    @inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService, openProjectService);
  }
  //#endregion

  //#region IRoutedDataService Interface methods ------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.get('/config', this.getConfig.bind(this) as RouteCallback);
    router.patch('/config', this.saveConfig.bind(this) as RouteCallback);
    router.post('/config/init', this.initConfig.bind(this) as RouteCallback);
  }
  //#endregion

  //#region IConfigurationService methods -------------------------------------
  public getApiConfiguration(): DtoApiConfiguration {
    return this.configuration.get('api') as DtoApiConfiguration;
  }

  public getLogConfiguration(): DtoLogConfiguration {
    return this.configuration.get('log') as DtoLogConfiguration;
  }

  public setBrowserWindow(browserWindow: BrowserWindow): IConfigurationService {
    this.browserWindow = browserWindow;
    return this;
  }

  public loadConfiguration(): IConfigurationService {
    const schemaContents = fs.readFileSync(path.resolve(app.getAppPath(), 'dist/main/static/configuration.schema.json'), 'utf-8');
    const schema = JSON.parse(schemaContents);
    this.configuration = new Conf({ schema });

    if (!this.configuration.get('api')) {
      this.configuration.set('api.apiKey', '');
      this.configuration.set('api.apiRoot', '');
      this.configuration.set('api.apiHost', '');
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
    if (!this.configuration.get('window')) {
      const window: IWindow = {
        maximized: false,
        minimized: false,
        size: {
          height: 600,
          width: 800
        }
      }
      this.configuration.set('window', window);
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

  //#region PATCH callback -----------------------------------------------------
  private async saveConfig(request: DtoDataRequest<DtoConfiguration>): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      const response = await this.openprojectService.validateConfig(request.data.api);
      if (response.status < DataStatus.BadRequest) {
        this.configuration.set('api', request.data.api);
        this.configuration.set('log', request.data.log);
        this.logService.setLogConfig(request.data.log);
        this.browserWindow.webContents.send('log-config', request.data.log);
      }
    } catch (error: any) {
      response = this.processServiceError(error);
    }
    return response
  }
  //#endregion

  //#region POST callback -----------------------------------------------------
  private async initConfig(request: DtoDataRequest<DtoConfiguration>): Promise<DtoUntypedDataResponse> {
    return this.openprojectService
      .initialize(request.data.api)
      .then((response: DtoOpenprojectInfo) => {
        this.configuration.set('api', request.data.api);
        this.configuration.set('log', request.data.log);
        this.logService.setLogConfig(request.data.log);
        this.browserWindow.webContents.send('log-config', request.data.log);
        resumeInitialization(response)
        return {
          status: DataStatus.Ok
        };
      })
      .catch((response: DtoUntypedDataResponse) => response);
  }
  //#endregion
}