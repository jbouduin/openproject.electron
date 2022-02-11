import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';

import { DtoDataRequest, DtoOpenprojectInfo, DtoProjectList, DtoWorkPackageStatusList, DtoWorkPackageTypeList, LogSource } from '@ipc';
import { IDataRouterService, IProjectsService, ISystemService, IWorkPackageStatusService, IWorkPackageTypeService } from '@data';
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

function refreshCache():void {
  const cacheService = container.get<ICacheService>(SERVICETYPES.CacheService);
  Promise.all([
    container.get<IWorkPackageTypeService>(SERVICETYPES.WorkPackageTypeService).getWorkPackageTypes(),
    container.get<IWorkPackageStatusService>(SERVICETYPES.WorkPackageStatusService).getWorkPackageStatuses()
  ])
  .then((value: [DtoWorkPackageTypeList, DtoWorkPackageStatusList]) => {
    container.get<IProjectsService>(SERVICETYPES.ProjectsService)
      .getProjects()
      .then((projects: DtoProjectList) => {
        cacheService.setCache({
          projects: projects,
          timeEntryActivities: undefined, // apparently not possible to retrieve them
          workPackageStatuses: value[1],
          workPackageTypes: value[0]
        });
      })
  })

}
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
  refreshCache();
  win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'));
  container
    .get<IOpenprojectService>(SERVICETYPES.OpenprojectService).initialize()
    .then((openprojectInfo: DtoOpenprojectInfo) => {
      container.get<ILogService>(SERVICETYPES.LogService).injectWindow(win);
      container.get<ISystemService>(SERVICETYPES.SystemService).initialize(win, openprojectInfo);
      container.get<IDataRouterService>(SERVICETYPES.DataRouterService).initialize();
    });
  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('dev-tools', () => {
  if (win) {
    win.webContents.toggleDevTools();
  }
});

ipcMain.on('refresh-cache', () => {
  refreshCache();
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
