import { DtoProjectReportSelection } from "@ipc";

export class ProjectReportSelection implements DtoProjectReportSelection {
  public constructor() {  }

  public static ResetProjectReportSelection(): DtoProjectReportSelection {
    const today = new Date();
    return new ProjectReportSelection();
  }
}