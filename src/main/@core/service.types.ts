const SERVICETYPES = {
  // Core services
  DataRouterService: Symbol('DataRouterService'),
  LogService: Symbol('LogService'),
  OpenprojectService: Symbol('OpenprojectService'),
  // Data services
  TimesheetExportService: Symbol('TimesheetExportService'),
  ReportService: Symbol('ReportService'),
  ProjectsService: Symbol('ProjectsService'),
  SystemService: Symbol('SystemService'),
  TimeEntriesService: Symbol('TimeEntriesService'),
  WorkPackagesService: Symbol('WorkPackagesService'),
  WorkPackageTypeService: Symbol('WorkPackageTypeService')
};

export default SERVICETYPES;
