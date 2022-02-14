import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';

import { DataStatus, DtoDataRequest, DtoDataResponse, DtoOpenprojectInfo, LogSource } from '@ipc';
import { IDataRouterService, ISystemService } from '@data';
import { ILogService, IOpenprojectService } from '@core';

import container from './@core/inversify.config';
import SERVICETYPES from './@core/service.types';
import { ICacheService } from '@data/openproject/cache-service';

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
  container.get<ICacheService>(SERVICETYPES.CacheService)
    .initialize()
    .then(() => {
      container
        .get<IOpenprojectService>(SERVICETYPES.OpenprojectService).initialize()
        .then((openprojectInfo: DtoOpenprojectInfo) => {
          container.get<ILogService>(SERVICETYPES.LogService).injectWindow(win);
          container.get<ISystemService>(SERVICETYPES.SystemService).initialize(win, openprojectInfo);
          container.get<IDataRouterService>(SERVICETYPES.DataRouterService).initialize();
        })
        .catch((reason: any) => console.log(reason));
      win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'))
        .catch((reason: any) => console.log(reason));
    })
    .catch((reason: any) => console.log(reason));
  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('dev-tools', () => {
  if (win) {
    win.webContents.toggleDevTools();
  }
});

ipcMain.on('data', (event: Electron.IpcMainEvent, arg: any) => {
  const logService = container.get<ILogService>(SERVICETYPES.LogService);
  logService.debug(LogSource.Main, '<=', arg);
  //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const dtoRequest: DtoDataRequest<any> = JSON.parse(arg);
  container
    .get<IDataRouterService>(SERVICETYPES.DataRouterService)
    .routeRequest(dtoRequest)
    .then((response) => { // Remark: when typing response, the calls to cache-service do not work anymore
      logService.debug(LogSource.Main, '=>', JSON.stringify(response, null, 2));
      event.reply(`data-${dtoRequest.id}`, JSON.stringify(response));
    })
    .catch((reason: any) => {
      logService.error(LogSource.Main, '=> ', JSON.stringify(reason, null, 2));
      const result: DtoDataResponse<any> = {
        status: DataStatus.Error,
        message: JSON.stringify(reason, null, 2)
      }
      event.reply(`data-${dtoRequest.id}`, JSON.stringify(result));
    });
})
