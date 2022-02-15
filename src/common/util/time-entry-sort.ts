import { DtoTimeEntry } from '../../ipc/data'

export interface ITimeEntrySort {
  /**
   * sort and array of DtoTimeEntry by date and start
   *
   * @param timeEntries the array of time entries to sort
   * @returns the sorted array
   */
  sortByDateAndTime(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry>;

  /**
   * sort and array of DtoTimeEntry by date, project and workpackage
   *
   * @param timeEntries the array of time entries to sort
   * @returns the sorted array
   */
  sortByDateAndProjectAndWorkPackage(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry>;

  /**
   * sort and array of DtoTimeEntry by project, workpackage and date
   *
   * @param timeEntries the array of time entries to sort
   * @returns the sorted array
   */
  sortByProjectAndWorkPackageAndDate(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry>;
}

export class TimeEntrySort implements ITimeEntrySort {

  //#region ITimeEntrySort interface methods-----------------------------------
  public sortByDateAndTime(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return timeEntries.sort(TimeEntrySort.compareDateAndTime);
  }

  public sortByDateAndProjectAndWorkPackage(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {

    return timeEntries.sort((a: DtoTimeEntry, b: DtoTimeEntry) => {
      let returnValue = 0;
      if (a.spentOn < b.spentOn) {
        returnValue = -1;
      } else if (a.spentOn > b.spentOn) {
        returnValue = 1;
      } else {
        returnValue = TimeEntrySort.compareProjectAndWorkPackage(a, b);
        if (returnValue == 0) {
          returnValue = TimeEntrySort.compareTime(a, b);
        }
      }
      return returnValue;
    });
  }

  public sortByProjectAndWorkPackageAndDate(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return timeEntries.sort((a: DtoTimeEntry, b: DtoTimeEntry) => {
      let returnValue = TimeEntrySort.compareProjectAndWorkPackage(a, b);
      if (returnValue == 0) {
        returnValue = TimeEntrySort.compareDateAndTime(a, b);
      }
      return returnValue;
    });
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private static compareDateAndTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let result = a.spentOn.getTime() - b.spentOn.getTime();
    if (result === 0) {
      result = TimeEntrySort.compareTime(a, b);
    }
    return result;
  }

  private static compareProjectAndWorkPackage(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let result = a.project.name.localeCompare(b.project.name);
    if (result === 0) {
      result = a.workPackage.subject.localeCompare(b.workPackage.subject);
    }
    return result;
  }

  private static compareTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    return a.start.localeCompare(b.start);
  }
  //#endregion

}