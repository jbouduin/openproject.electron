import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { serializeError } from 'serialize-error';

import { DataStatus, DtoAppInfo, DtoDataRequest, DtoDataResponse, DtoOpenprojectInfo } from '@common';
import { LogSource } from '@common';
import { IConfigurationService, IDataRouterService, ISystemService, IWindow } from '@data';
import { ILogService, IOpenprojectService } from '@core';

import container from './@core/inversify.config';
import SERVICETYPES from './@core/service.types';
import { ICacheService } from '@data/openproject/cache-service';

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
  const configService = container.get<IConfigurationService>(SERVICETYPES.ConfigurationService).loadConfiguration();
  const window = configService.window;

  win = new BrowserWindow({
    width: window.maximized ? undefined : window.size.width,
    height: window.maximized ? undefined : window.size.height,
    title: `Openproject client (V${app.getVersion()})`,
    webPreferences: {
      // Disabled Node integration
      nodeIntegration: false,
      // protect against prototype pollution
      contextIsolation: true,
      // Preload script
      preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js')
    }
  });
  if (window.maximized) {
    win.maximize();
  } else if (window.minimized) {
    win.minimize();
  } else if (window.position) {
    win.setPosition(window.position.x, window.position.y);
  }
  // https://stackoverflow.com/a/58548866/600559
  Menu.setApplicationMenu(null);

  win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'))
    .then(() => {
      // we need this very early, as it is possible that we will have to query for the config
      container.get<IDataRouterService>(SERVICETYPES.DataRouterService).initialize();
      configService.setBrowserWindow(win);

      const logConfig = configService.getLogConfiguration();
      win.webContents.send('log-config', logConfig);
      if (configService.devtoolsConfiguration) {
        win.webContents.toggleDevTools();
      }
      setDevtoolsTriggers(win.webContents);
      const apiConfig = configService.getApiConfiguration();
      if (!apiConfig.apiHost || !apiConfig.apiKey) {
        win.webContents.send('system-status', 'config-required');
      } else {
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
      }
    })
    .catch((reason: any) => dialog.showErrorBox(
      'Error loading index.htnl',
      JSON.stringify(serializeError(reason), null, 2))
    );

  win.on('close', () => {
    const size = win.getSize();
    const position = win.getPosition();
    const window: IWindow = {
      size: {
        width: size[0],
        height: size[1]
      },
      position: {
        x: position[0],
        y: position[1]
      },
      maximized: win.isMaximized(),
      minimized: win.isMinimized()
    };
    container.get<IConfigurationService>(SERVICETYPES.ConfigurationService).window = window;
  });


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
    win.webContents.toggleDevTools();
  }
});

ipcMain.on('data', (event: Electron.IpcMainEvent, ...arg: Array<any>) => {
  const logService = container.get<ILogService>(SERVICETYPES.LogService);
  // no idea why arg is an array of arrays
  const dtoRequest = arg[0][0] as DtoDataRequest<any>;
  logService.debug(LogSource.Main, `<= ${dtoRequest.verb} ${dtoRequest.path}`, arg);
  container
    .get<IDataRouterService>(SERVICETYPES.DataRouterService)
    .routeRequest(dtoRequest)
    .then((response) => { // Remark: when typing response, the calls to cache-service did not work anymore
      logService.debug(LogSource.Main, `=> ${dtoRequest.verb} ${dtoRequest.path}`, response);
      event.reply(`data-${dtoRequest.id}`, response);
    })
    .catch((reason: any) => {
      const result: DtoDataResponse<any> = {
        status: DataStatus.Error,
        message: `Error processing ${dtoRequest.verb} ${dtoRequest.path}`,
        data: serializeError(reason)
      }
      event.reply(`data-${dtoRequest.id}`, result);
    });
});
//#endregion

//#region private functions ---------------------------------------------------
function setDevtoolsTriggers(webContents: Electron.WebContents): void {
  webContents.on('devtools-closed', () => {
    const configurationService = container.get<IConfigurationService>(SERVICETYPES.ConfigurationService);
    configurationService.devtoolsConfiguration = false;
  });
  webContents.on('devtools-opened', () => {
    const configurationService = container.get<IConfigurationService>(SERVICETYPES.ConfigurationService);
    configurationService.devtoolsConfiguration = true;
  });
}