import { Container } from 'inversify';

import { IProjectsService, ProjectsService} from '@data';
import { IDataRouterService, DataRouterService } from '@data';

import { ISystemService, SystemService } from '@data';
import { ILogService, LogService } from '@core';
import { IOpenprojectService, OpenprojectService } from '@core';

import SERVICETYPES from './service.types';

const container = new Container();

// <editor-fold desc='Core services'>
container.bind<ILogService>(SERVICETYPES.LogService).to(LogService).inSingletonScope();
container.bind<IOpenprojectService>(SERVICETYPES.OpenprojectService).to(OpenprojectService);
// </editor-fold>

// <editor-fold desc='Data Services'>
container.bind<IDataRouterService>(SERVICETYPES.DataRouterService).to(DataRouterService).inSingletonScope();
container.bind<IProjectsService>(SERVICETYPES.ProjectsService).to(ProjectsService);
container.bind<ISystemService>(SERVICETYPES.SystemService).to(SystemService);
// </editor-fold>

export default container;
