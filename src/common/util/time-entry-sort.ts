import { DtoTimeEntry } from '../../ipc/data'

export class TimeEntrySort {
  private static compareDateAndTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let returnValue = 0;
    if (a.spentOn < b.spentOn) {
      returnValue = -1;
    } else if (a.spentOn > b.spentOn) {
      returnValue = 1;
    } else {
      returnValue = TimeEntrySort.compareTime(a, b);
    }
    return returnValue;
  }

  private static compareProjectAndWorkPackage(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let returnValue = 0;
    if (a.project.name < b.project.name) {
      returnValue = -1;
    } else if (a.project.name > b.project.name) {
      returnValue = 1;
    } else {
      if (a.workPackage.subject < b.workPackage.subject) {
        returnValue = -1;
      } else if (a.workPackage.subject > b.workPackage.subject) {
        returnValue = 1;
      }
    }
    return returnValue;
  }

  private static compareTime(a: DtoTimeEntry, b: DtoTimeEntry): number {
    let returnValue = 0;
    if (a.customField2 < b.customField2) {
      returnValue = -1;
    } else if (a.customField2 > b.customField2) {
      returnValue = 1;
    }
    return returnValue;
  }

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
}