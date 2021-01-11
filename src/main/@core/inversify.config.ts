import { Container } from 'inversify';

import { ICategoryCollectionAdapter, CategoryCollectionAdapter } from '@adapters';
import { ICategoryEntityAdapter, CategoryEntityAdapter } from '@adapters';
import { IProjectCollectionAdapter, ProjectCollectionAdapter } from '@adapters';
import { IProjectEntityAdapter, ProjectEntityAdapter } from '@adapters';
import { ISchemaAdapter, SchemaAdapter } from '@adapters';
import { ITimeEntryActivityEntityAdapter, TimeEntryActivityEntityAdapter } from '@adapters';
import { ITimeEntryCollectionAdapter, TimeEntryCollectionAdapter } from '@adapters';
import { ITimeEntryEntityAdapter, TimeEntryEntityAdapter } from '@adapters';
import { ITimeEntryFormAdapter, TimeEntryFormAdapter } from '@adapters';
import { IWorkPackageCollectionAdapter, WorkPackageCollectionAdapter } from '@adapters';
import { IWorkPackageEntityAdapter, WorkPackageEntityAdapter } from '@adapters';
import { IWorkPackageTypeCollectionAdapter, WorkPackageTypeCollectionAdapter } from '@adapters';
import { IWorkPackageTypeEntityAdapter, WorkPackageTypeEntityAdapter } from '@adapters';

import { ILogService, LogService } from '@core';
import { IOpenprojectService, OpenprojectService } from '@core';

import { IDataRouterService, DataRouterService } from '@data';
import { IProjectsService, ProjectsService} from '@data';
import { ISystemService, SystemService } from '@data';
import { ITimeEntriesService, TimeEntriesService } from '@data';
import { ITimesheetExportService, TimesheetExportService } from '@data/export/timesheet-export.service';
import { IWorkPackagesService, WorkPackagesService } from '@data';
import { IWorkPackageTypeService, WorkPackageTypeService } from '@data';

import ADAPTERTYPES from '../adapters/adapter.types';
import SERVICETYPES from './service.types';

const container = new Container();

// <editor-fold desc='Core services'>
container.bind<ILogService>(SERVICETYPES.LogService).to(LogService).inSingletonScope();
container.bind<IOpenprojectService>(SERVICETYPES.OpenprojectService).to(OpenprojectService).inSingletonScope();
// </editor-fold>

// <editor-fold desc='Adapters'>
container.bind<ICategoryCollectionAdapter>(ADAPTERTYPES.CategoryCollectionAdapter).to(CategoryCollectionAdapter);
container.bind<ICategoryEntityAdapter>(ADAPTERTYPES.CategoryEntityAdapter).to(CategoryEntityAdapter);
container.bind<IProjectCollectionAdapter>(ADAPTERTYPES.ProjectCollectionAdapter).to(ProjectCollectionAdapter);
container.bind<IProjectEntityAdapter>(ADAPTERTYPES.ProjectEntityAdapter).to(ProjectEntityAdapter);
container.bind<ISchemaAdapter>(ADAPTERTYPES.SchemaAdapter).to(SchemaAdapter);
container.bind<ITimeEntryActivityEntityAdapter>(ADAPTERTYPES.TimeEntryActivityEntityAdapter).to(TimeEntryActivityEntityAdapter);
container.bind<ITimeEntryCollectionAdapter>(ADAPTERTYPES.TimeEntryCollectionAdapter).to(TimeEntryCollectionAdapter);
container.bind<ITimeEntryEntityAdapter>(ADAPTERTYPES.TimeEntryEntityAdapter).to(TimeEntryEntityAdapter);
container.bind<ITimeEntryFormAdapter>(ADAPTERTYPES.TimeEntryFormAdapter).to(TimeEntryFormAdapter);
container.bind<IWorkPackageCollectionAdapter>(ADAPTERTYPES.WorkPackageCollectionAdapter).to(WorkPackageCollectionAdapter);
container.bind<IWorkPackageEntityAdapter>(ADAPTERTYPES.WorkPackageEntityAdapter).to(WorkPackageEntityAdapter);
container.bind<IWorkPackageTypeCollectionAdapter>(ADAPTERTYPES.WorkPackageTypeCollectionAdapter).to(WorkPackageTypeCollectionAdapter);
container.bind<IWorkPackageTypeEntityAdapter>(ADAPTERTYPES.WorkPackageTypeEntityAdapter).to(WorkPackageTypeEntityAdapter);
// </editor-fold>

// <editor-fold desc='Data Services'>
container.bind<ITimesheetExportService>(SERVICETYPES.TimesheetExportService).to(TimesheetExportService);
container.bind<IDataRouterService>(SERVICETYPES.DataRouterService).to(DataRouterService).inSingletonScope();
container.bind<IProjectsService>(SERVICETYPES.ProjectsService).to(ProjectsService);
container.bind<ISystemService>(SERVICETYPES.SystemService).to(SystemService).inSingletonScope();
container.bind<ITimeEntriesService>(SERVICETYPES.TimeEntriesService).to(TimeEntriesService);
container.bind<IWorkPackagesService>(SERVICETYPES.WorkPackagesService).to(WorkPackagesService);
container.bind<IWorkPackageTypeService>(SERVICETYPES.WorkPackageTypeService).to(WorkPackageTypeService);
// </editor-fold>

export default container;
