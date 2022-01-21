const SERVICETYPES = {
  // Core services
  DataRouterService: Symbol('DataRouterService'),
  LogService: Symbol('LogService'),
  OpenprojectService: Symbol('OpenprojectService'),
  // Data services
  ProjectsService: Symbol('ProjectsService'),
  SystemService: Symbol('SystemService'),
  TimeEntriesService: Symbol('TimeEntriesService'),
  WorkPackagesService: Symbol('WorkPackagesService'),
  WorkPackageTypeService: Symbol('WorkPackageTypeService'),
  // export services
  MonthlyReportService: Symbol('MonthlyReportService'),
  ProjectReportService: Symbol('ProjectReportService'),
  TimesheetExportService: Symbol('TimesheetExportService')
};

export default SERVICETYPES;
