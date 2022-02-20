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

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

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
  const configService = container
    .get<IConfigurationService>(SERVICETYPES.ConfigurationService)
    .initialize();
  const apiConfig = configService.getApiConfiguration();
  const logConfig = configService.getLogConfiguration();
  container.get<ILogService>(SERVICETYPES.LogService).initialize(win, logConfig);
  container
    .get<IOpenprojectService>(SERVICETYPES.OpenprojectService).initialize(apiConfig)
    .then((openprojectInfo: DtoOpenprojectInfo) => {
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
          container.get<IDataRouterService>(SERVICETYPES.DataRouterService).initialize();
        })
        .catch((reason: any) => dialog.showErrorBox(
          'Error initializing the cache service',
          JSON.stringify(serializeError(reason), null, 2)));
      win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'))
        .catch((reason: any) => dialog.showErrorBox(
          'Error loading index.htnl',
          JSON.stringify(serializeError(reason), null, 2)));
    })
    .catch((reason: any) => dialog.showErrorBox(
      'Error initializing the openproject service',
      JSON.stringify(serializeError(reason), null, 2)));

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('dev-tools', () => {
  if (win) {
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
      // TODO as this will make the snackbar popup, this should be handled in ipcservice in renderer
      logService.error(LogSource.Main, `Error processing ${dtoRequest.verb} ${dtoRequest.path}`, serializeError(reason));
      const result: DtoDataResponse<any> = {
        status: DataStatus.Error,
        message: `Error processing ${dtoRequest.verb} ${dtoRequest.path}`,
        data: serializeError(reason)
      }
      event.reply(`data-${dtoRequest.id}`, JSON.stringify(result));
    });
})
