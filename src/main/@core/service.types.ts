const SERVICETYPES = {
  //#region  Core services ----------------------------------------------------
  CacheService: Symbol('CacheService'),
  DataRouterService: Symbol('DataRouterService'),
  LogService: Symbol('LogService'),
  OpenprojectService: Symbol('OpenprojectService'),
  //#endregion

  //#region Data services -----------------------------------------------------
  ProjectsService: Symbol('ProjectsService'),
  ProjectQueriesService: Symbol('ProjectQueriesService'),
  SystemService: Symbol('SystemService'),
  TimeEntriesService: Symbol('TimeEntriesService'),
  WorkPackagesService: Symbol('WorkPackagesService'),
  WorkPackageStatusService: Symbol('WorkPackageStatusService'),
  WorkPackageTypeService: Symbol('WorkPackageTypeService'),
  //#endregion

  //#region export services ---------------------------------------------------
  MonthlyReportService: Symbol('MonthlyReportService'),
  ProjectReportService: Symbol('ProjectReportService'),
  TimesheetExportService: Symbol('TimesheetExportService')
  //#endregion
};

export default SERVICETYPES;
