import { DtoTimeEntry } from '../ipc/time-entry/dto-time-entry';

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
    return timeEntries.sort((a: DtoTimeEntry, b: DtoTimeEntry) => this.compareDateAndTime(a, b));
  }

  public sortByDateAndProjectAndWorkPackage(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {

    return timeEntries.sort((a: DtoTimeEntry, b: DtoTimeEntry) => {
      let returnValue = 0;
      if (a.spentOn < b.spentOn) {
        returnValue = -1;
      } else if (a.spentOn > b.spentOn) {
        returnValue = 1;
      } else {
        returnValue = this.compareProjectAndWorkPackage(a, b);
        if (returnValue == 0) {
          returnValue = this.compareTime(a, b);
        }
      }
      return returnValue;
    });
  }

  public sortByProjectAndWorkPackageAndDate(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return timeEntries.sort((a: DtoTimeEntry, b: DtoTimeEntry) => {
      let returnValue = this.compareProjectAndWorkPackage(a, b);
      if (returnValue == 0) {
        returnValue = this.compareDateAndTime(a, b);
      }
      return returnValue;
    });
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private compareDateAndTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let result = a.spentOn.getTime() - b.spentOn.getTime();
    if (result === 0) {
      result = this.compareTime(a, b);
    }
    return result;
  }

  private compareProjectAndWorkPackage(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let result = a.project.name.localeCompare(b.project.name);
    if (result === 0) {
      result = a.workPackage.subject.localeCompare(b.workPackage.subject);
    }
    return result;
  }

  private compareTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    return a.start.localeCompare(b.start);
  }
  //#endregion

}