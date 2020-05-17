import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import * as os from 'os';

import { DtoDataRequest, LogSource } from '@ipc';
import { IDataRouterService } from '@data';
import { ILogService } from '@core';

import container from './@core/inversify.config';
import SERVICETYPES from './@core/service.types';

let win: BrowserWindow;

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Disabled Node integration
      nodeIntegration: false,
      // protect against prototype pollution
      contextIsolation: true,
      // turn off remote
      enableRemoteModule: false,
      // Preload script
      preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js')
    }
  });
  // https://stackoverflow.com/a/58548866/600559
  Menu.setApplicationMenu(null);

  win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'));
  container.get<ILogService>(SERVICETYPES.LogService).injectWindow(win);
  container.get<IDataRouterService>(SERVICETYPES.DataRouterService).initialize();
  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('dev-tools', () => {
  if (win) {
    win.webContents.toggleDevTools();
  }
});

ipcMain.on('data', async (event, arg) => {
  const logService = container.get<ILogService>(SERVICETYPES.LogService);
  logService.debug(LogSource.Main, '<=', arg);
  const dtoRequest: DtoDataRequest<any> = JSON.parse(arg);

  const result = await container
    .get<IDataRouterService>(SERVICETYPES.DataRouterService)
    .routeRequest(dtoRequest);
  logService.debug(LogSource.Main, '=>', JSON.stringify(result, null, 2))
  event.reply(`data-${dtoRequest.id}`, JSON.stringify(result));
})
