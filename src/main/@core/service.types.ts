const SERVICETYPES = {
  // Core services
  DataRouterService: Symbol('DataRouterService'),
  LogService: Symbol('LogService'),
  OpenprojectService: Symbol('OpenprojectService'),
  // Data services
  ExportService: Symbol('ExportService'),
  ProjectsService: Symbol('ProjectsService'),
  SystemService: Symbol('SystemService'),
  TimeEntriesService: Symbol('TimeEntriesService'),
  WorkPackagesService: Symbol('WorkPackagesService')
};

export default SERVICETYPES;
