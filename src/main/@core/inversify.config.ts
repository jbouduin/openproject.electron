import { Container } from 'inversify';

//#region adapters ------------------------------------------------------------
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
import { IWorkPackageStatusCollectionAdapter, WorkPackageStatusCollectionAdapter } from '@adapters';
import { IWorkPackageStatusEntityAdapter, WorkPackageStatusEntityAdapter } from '@adapters';
import { IWorkPackageTypeCollectionAdapter, WorkPackageTypeCollectionAdapter } from '@adapters';
import { IWorkPackageTypeEntityAdapter, WorkPackageTypeEntityAdapter } from '@adapters';
//#endregion

//#region  Core services ----------------------------------------------------
import { IDataRouterService, DataRouterService } from '@data';
import { ILogService, LogService } from '@core';
import { IOpenprojectService, OpenprojectService } from '@core';
//#endregion

//#region Data services -----------------------------------------------------
import { IProjectsService, ProjectsService} from '@data';
import { IProjectQueriesService, ProjectQueriesService } from '@data';
import { ISystemService, SystemService } from '@data';
import { ITimeEntriesService, TimeEntriesService } from '@data';
import { IWorkPackagesService, WorkPackagesService } from '@data';
import { IWorkPackageTypeService, WorkPackageTypeService } from '@data';
//#endregion

//#region export services ---------------------------------------------------
import { IMonthlyReportService, MonthlyReportService } from '@data';
import { IProjectReportService, ProjectReportService } from '@data';
import { ITimesheetExportService, TimesheetExportService } from '@data';
//#endregion

import ADAPTERTYPES from '../adapters/adapter.types';
import SERVICETYPES from './service.types';

const container = new Container();

//#region apdaters ------------------------------------------------------------
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
container.bind<IWorkPackageStatusCollectionAdapter>(ADAPTERTYPES.WorkPackageStatusCollectionAdapter).to(WorkPackageStatusCollectionAdapter);
container.bind<IWorkPackageStatusEntityAdapter>(ADAPTERTYPES.WorkPackageStatusEntityAdapter).to(WorkPackageStatusEntityAdapter);
container.bind<IWorkPackageTypeCollectionAdapter>(ADAPTERTYPES.WorkPackageTypeCollectionAdapter).to(WorkPackageTypeCollectionAdapter);
container.bind<IWorkPackageTypeEntityAdapter>(ADAPTERTYPES.WorkPackageTypeEntityAdapter).to(WorkPackageTypeEntityAdapter);
//#endregion

//#region  Core services ----------------------------------------------------
container.bind<IDataRouterService>(SERVICETYPES.DataRouterService).to(DataRouterService).inSingletonScope();
container.bind<ILogService>(SERVICETYPES.LogService).to(LogService).inSingletonScope();
container.bind<IOpenprojectService>(SERVICETYPES.OpenprojectService).to(OpenprojectService).inSingletonScope();
//#endregion

//#region Data services -----------------------------------------------------
container.bind<IProjectsService>(SERVICETYPES.ProjectsService).to(ProjectsService);
container.bind<IProjectQueriesService>(SERVICETYPES.ProjectQueriesService).to(ProjectQueriesService);
container.bind<ISystemService>(SERVICETYPES.SystemService).to(SystemService).inSingletonScope();
container.bind<ITimeEntriesService>(SERVICETYPES.TimeEntriesService).to(TimeEntriesService);
container.bind<IWorkPackagesService>(SERVICETYPES.WorkPackagesService).to(WorkPackagesService);
container.bind<IWorkPackageTypeService>(SERVICETYPES.WorkPackageTypeService).to(WorkPackageTypeService);
//#endregion

//#region export services ---------------------------------------------------
container.bind<IMonthlyReportService>(SERVICETYPES.MonthlyReportService).to(MonthlyReportService);
container.bind<IProjectReportService>(SERVICETYPES.ProjectReportService).to(ProjectReportService);
container.bind<ITimesheetExportService>(SERVICETYPES.TimesheetExportService).to(TimesheetExportService);
//#endregion



export default container;
