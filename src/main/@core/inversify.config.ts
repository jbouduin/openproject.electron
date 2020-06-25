import { Container } from 'inversify';

import { ICategoryCollectionAdapter, CategoryCollectionAdapter } from '@adapters';
import { ICategoryEntityAdapter, CategoryEntityAdapter } from '@adapters';
import { IProjectCollectionAdapter, ProjectCollectionAdapter } from '@adapters';
import { IProjectEntityAdapter, ProjectEntityAdapter } from '@adapters';
import { ITimeEntryCollectionAdapter, TimeEntryCollectionAdapter } from '@adapters';
import { ITimeEntryEntityAdapter, TimeEntryEntityAdapter } from '@adapters';

import { ILogService, LogService } from '@core';
import { IOpenprojectService, OpenprojectService } from '@core';

import { IDataRouterService, DataRouterService } from '@data';
import { IProjectsService, ProjectsService} from '@data';
import { ISystemService, SystemService } from '@data';
import { ITimeEntriesService, TimeEntriesService } from '@data';

import ADAPTERTYPES from '../adapters/adapter.types';
import SERVICETYPES from './service.types';

const container = new Container();

// <editor-fold desc='Core services'>
container.bind<ILogService>(SERVICETYPES.LogService).to(LogService).inSingletonScope();
container.bind<IOpenprojectService>(SERVICETYPES.OpenprojectService).to(OpenprojectService);
// </editor-fold>

// <editor-fold desc='Adapters'>
container.bind<ICategoryCollectionAdapter>(ADAPTERTYPES.CategoryCollectionAdapter).to(CategoryCollectionAdapter);
container.bind<ICategoryEntityAdapter>(ADAPTERTYPES.CategoryEntityAdapter).to(CategoryEntityAdapter);
container.bind<IProjectCollectionAdapter>(ADAPTERTYPES.ProjectCollectionAdapter).to(ProjectCollectionAdapter);
container.bind<IProjectEntityAdapter>(ADAPTERTYPES.ProjectEntityAdapter).to(ProjectEntityAdapter);
container.bind<ITimeEntryCollectionAdapter>(ADAPTERTYPES.TimeEntryCollectionAdapter).to(TimeEntryCollectionAdapter);
container.bind<ITimeEntryEntityAdapter>(ADAPTERTYPES.TimeEntryEntityAdapter).to(TimeEntryEntityAdapter);

// </editor-fold>

// <editor-fold desc='Data Services'>
container.bind<IDataRouterService>(SERVICETYPES.DataRouterService).to(DataRouterService).inSingletonScope();
container.bind<IProjectsService>(SERVICETYPES.ProjectsService).to(ProjectsService);
container.bind<ISystemService>(SERVICETYPES.SystemService).to(SystemService);
container.bind<ITimeEntriesService>(SERVICETYPES.TimeEntriesService).to(TimeEntriesService);
// </editor-fold>

export default container;
