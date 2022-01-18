import { DtoProjectReportSelection } from "@ipc";

export class ProjectReportSelection implements DtoProjectReportSelection {
  public projectId: number;
  public constructor(projectId: number = 0) {
    this.projectId = projectId;
  }

  public static ResetProjectReportSelection(): DtoProjectReportSelection {
    return new ProjectReportSelection();
  }
}