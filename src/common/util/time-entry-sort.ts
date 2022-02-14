import { DtoTimeEntry } from '../../ipc/data'

// TODO implement as a service
export class TimeEntrySort {

  //#region private methods ---------------------------------------------------
  private static compareDateAndTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let result = a.spentOn.getTime() - b.spentOn.getTime();
    if (result === 0) {
      result = TimeEntrySort.compareTime(a, b);
    }
    return result;
  }

  private static compareProjectAndWorkPackage(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let result =a.project.name.localeCompare(b.project.name);
    if (result === 0) {
      result = a.workPackage.subject.localeCompare(b.workPackage.subject);
    }
    return result;
  }

  private static compareTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    return a.start.localeCompare(b.start);
  }
  //#endregion

  //#region public methods-----------------------------------------------------
  /**
   * sort by date and start
   */
  public static sortByDateAndTime(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return timeEntries.sort(TimeEntrySort.compareDateAndTime);
  }


  /**
   * sort by date, project, wp and start
   * @param timeEntries
   */
  public static sortByDateAndProjectAndWorkPackage(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {

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

  /**
   * sort by project, wp, date and start
   * @param timeEntries
   */
  public static sortByProjectAndWorkPackageAndDate(timeEntries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    return timeEntries.sort((a: DtoTimeEntry, b: DtoTimeEntry) => {
      let returnValue = TimeEntrySort.compareProjectAndWorkPackage(a, b);
      if (returnValue == 0) {
        returnValue = TimeEntrySort.compareDateAndTime(a, b);
      }
      return returnValue;
    });
  }


  //#endregion
}