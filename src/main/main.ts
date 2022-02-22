import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { serializeError } from 'serialize-error';

import { DataStatus, DtoAppInfo, DtoDataRequest, DtoDataResponse, DtoOpenprojectInfo } from '@ipc';
import { LogSource } from '@common';
import { IConfigurationService, IDataRouterService, ISystemService } from '@data';
import { ILogService, IOpenprojectService } from '@core';

import container from './@core/inversify.config';
import SERVICETYPES from './@core/service.types';
import { ICacheService } from '@data/openproject/cache-service';
import { dateTimeReviver } from '../common/util/date-reviver';

let win: BrowserWindow;

//#region main entry point(s)
app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
//#endregion

//#region functions
function createWindow(): void {
  win = new BrowserWindow({
    width: 800,
    title: `Openproject client (V${app.getVersion()})`,
    height: 600,
    webPreferences: {
      // Disabled Node integration
      nodeIntegration: false,
      // protect against prototype pollution
      contextIsolation: true,
      // Preload script
      preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js')
    }
  });

  // https://stackoverflow.com/a/58548866/600559
  Menu.setApplicationMenu(null);

  win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'))
    .then(() => {
      // we need this very early, as it is possible that we will have to query for the config
      container.get<IDataRouterService>(SERVICETYPES.DataRouterService).initialize();
      const configService = container
        .get<IConfigurationService>(SERVICETYPES.ConfigurationService)
        .initialize(win);
      const apiConfig = configService.getApiConfiguration();
      const logConfig = configService.getLogConfiguration();
      win.webContents.send('log-config', logConfig);
      if (configService.devtoolsConfiguration) {
        win.webContents.toggleDevTools();
      }
      container.get<ILogService>(SERVICETYPES.LogService).initialize(win, logConfig);
      container
        .get<IOpenprojectService>(SERVICETYPES.OpenprojectService).initialize(apiConfig)
        .then((openprojectInfo: DtoOpenprojectInfo) => {
          continueInitialization(openprojectInfo);
        })
        .catch((reason: any) => {
          // if we get an error status here which is 401, 500 or 404 the user gets the settings dialog
          if (reason.isAxiosError && (reason.response.status === DataStatus.Unauthorized || reason.response.status === DataStatus.NotFound || reason.response.status === DataStatus.Error)) {
            win.webContents.send('system-status', 'config-required');
          } else {
            dialog.showErrorBox(
              'Error initializing the openproject service',
              JSON.stringify(serializeError(reason), null, 2));
          }
        });
    })
    .catch((reason: any) => dialog.showErrorBox(
      'Error loading index.htnl',
      JSON.stringify(serializeError(reason), null, 2))
    );
  win.on('closed', () => {
    win = null;
  });
}

function continueInitialization(openprojectInfo: DtoOpenprojectInfo): void {
  container.get<ICacheService>(SERVICETYPES.CacheService)
    .initialize()
    .then(() => {
      const appInfo: DtoAppInfo = {
        appVersion: app.getVersion(),
        electronVersion: process.versions.electron,
        chromiumVersion: process.versions.chrome,
        nodeVersion: process.versions.node
      };
      container.get<ISystemService>(SERVICETYPES.SystemService).initialize(win, openprojectInfo, appInfo);
    })
    .catch((reason: any) => {
      dialog.showErrorBox(
        'Error initializing the cache service',
        JSON.stringify(serializeError(reason), null, 2))
    })
    .finally(() => {
      win.webContents.send('system-status', 'ready');
    });
}

export function resumeInitialization(openProjectInfo: DtoOpenprojectInfo): void {
  continueInitialization(openProjectInfo);
}
//#endregion

//#region ipc message capture -------------------------------------------------
ipcMain.on('dev-tools', () => {
  if (win) {
    const configurationService = container.get<IConfigurationService>(SERVICETYPES.ConfigurationService);
    configurationService.devtoolsConfiguration = !configurationService.devtoolsConfiguration;
    win.webContents.toggleDevTools();
  }
});

ipcMain.on('data', (event: Electron.IpcMainEvent, arg: string) => {
  const logService = container.get<ILogService>(SERVICETYPES.LogService);
  const dtoRequest: DtoDataRequest<any> = JSON.parse(arg, dateTimeReviver);
  logService.debug(LogSource.Main, `<= ${dtoRequest.verb} ${dtoRequest.path}`, dtoRequest);
  container
    .get<IDataRouterService>(SERVICETYPES.DataRouterService)
    .routeRequest(dtoRequest)
    .then((response) => { // Remark: when typing response, the calls to cache-service did not work anymore
      logService.debug(LogSource.Main, `=> ${dtoRequest.verb} ${dtoRequest.path}`, response);
      event.reply(`data-${dtoRequest.id}`, JSON.stringify(response));
    })
    .catch((reason: any) => {
      // TODO #1746 as this will make the snackbar popup, this should probably be handled in ipcservice in renderer
      logService.error(LogSource.Main, `Error processing ${dtoRequest.verb} ${dtoRequest.path}`, serializeError(reason));
      const result: DtoDataResponse<any> = {
        status: DataStatus.Error,
        message: `Error processing ${dtoRequest.verb} ${dtoRequest.path}`,
        data: serializeError(reason)
      }
      event.reply(`data-${dtoRequest.id}`, JSON.stringify(result));
    });
});
//#endregion

