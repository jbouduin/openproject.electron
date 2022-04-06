import { DtoTimeEntry } from '@common';
import { ITimeEntrySort, TimeEntrySort } from '@common';
import { injectable } from 'inversify';

export type ITimeEntrySortService = ITimeEntrySort;

@injectable()
export class TimeEntrySortService implements ITimeEntrySortService {
  /**
   * have to create an instance of TimEntrySort, as it is a class in @common and
   * thus we can not assign it the injectable decorator
  */

  //#region private properties ------------------------------------------------
  private timeEntrySort: TimeEntrySort;
  //#endregion

  //#region constructor & C° --------------------------------------------------
  public constructor() {
    this.timeEntrySort = new TimeEntrySort();
  }
  //#endregion

  //#region ITimeEntrySortService methods -------------------------------------
  public sortByDateAndTime(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return this.timeEntrySort.sortByDateAndTime(timeEntries);
  }

  public sortByDateAndProjectAndWorkPackage(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return this.timeEntrySort.sortByDateAndProjectAndWorkPackage(timeEntries);
  }

  public sortByProjectAndWorkPackageAndDate(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return this.timeEntrySort.sortByProjectAndWorkPackageAndDate(timeEntries);
  }
  //#endregion
}