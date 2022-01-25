const ADAPTERTYPES = {
  //#region entity adapters ---------------------------------------------------
  CategoryEntityAdapter: Symbol('CategoryEntityAdapter'),
  ProjectEntityAdapter: Symbol('ProjectEntityAdapter'),
  TimeEntryActivityEntityAdapter: Symbol('TimeEntryActivityEntityAdapter'),
  TimeEntryEntityAdapter: Symbol('TimeEntryEntityAdapter'),
  WorkPackageEntityAdapter: Symbol('WorkPackageEntityAdapter'),
  WorkPackageStatusEntityAdapter: Symbol('WorkPackageStatusEntityAdapter'),
  WorkPackageTypeEntityAdapter: Symbol('WorkPackageTypeEntityAdapter'),
  //#endregion

  //#region collection adapters -----------------------------------------------
  CategoryCollectionAdapter: Symbol('CategoryCollectionAdapter'),
  ProjectCollectionAdapter: Symbol('ProjectCollectionAdapter'),
  TimeEntryActivityCollectionAdapter: Symbol('TimeEntryActivityCollectionAdapter'),
  TimeEntryCollectionAdapter: Symbol('TimeEntryCollectionAdapter'),
  WorkPackageCollectionAdapter: Symbol('WorkPackageCollectionAdapter'),
  WorkPackageStatusCollectionAdapter: Symbol('WorkPackageStatusCollectionAdapter'),
  WorkPackageTypeCollectionAdapter: Symbol('WorkPackageTypeCollectionAdapter'),
  //#endregion

  //#region form adapters -----------------------------------------------------
  TimeEntryFormAdapter: Symbol('TimeEntryFormAdapter'),
  //#endregion

  //#region special case ------------------------------------------------------
  SchemaAdapter: Symbol('SchemaAdapter')
  //#endregion
};

export default ADAPTERTYPES;
