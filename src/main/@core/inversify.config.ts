import { Container } from 'inversify';

import { IHalResourceHelper, HalResourceHelper } from '@adapters';
import { ICategoryListAdapter, CategoryListAdapter } from '@adapters';
import { ICategoryAdapter, CategoryAdapter } from '@adapters';
import { IProjectListAdapter, ProjectListAdapter } from '@adapters';
import { IProjectAdapter, ProjectAdapter } from '@adapters';
import { ITimeEntryListAdapter, TimeEntryListAdapter } from '@adapters';
import { ITimeEntryAdapter, TimeEntryAdapter } from '@adapters';

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
container.bind<IHalResourceHelper>(ADAPTERTYPES.HalResourceHelper).to(HalResourceHelper);
container.bind<ICategoryListAdapter>(ADAPTERTYPES.CategoryListAdapter).to(CategoryListAdapter);
container.bind<ICategoryAdapter>(ADAPTERTYPES.CategoryAdapter).to(CategoryAdapter);
container.bind<IProjectListAdapter>(ADAPTERTYPES.ProjectListAdapter).to(ProjectListAdapter);
container.bind<IProjectAdapter>(ADAPTERTYPES.ProjectAdapter).to(ProjectAdapter);
container.bind<ITimeEntryListAdapter>(ADAPTERTYPES.TimeEntryListAdapter).to(TimeEntryListAdapter);
container.bind<ITimeEntryAdapter>(ADAPTERTYPES.TimeEntryAdapter).to(TimeEntryAdapter);
// </editor-fold>

// <editor-fold desc='Data Services'>
container.bind<IDataRouterService>(SERVICETYPES.DataRouterService).to(DataRouterService).inSingletonScope();
container.bind<IProjectsService>(SERVICETYPES.ProjectsService).to(ProjectsService);
container.bind<ISystemService>(SERVICETYPES.SystemService).to(SystemService);
container.bind<ITimeEntriesService>(SERVICETYPES.TimeEntriesService).to(TimeEntriesService);
// </editor-fold>

export default container;
